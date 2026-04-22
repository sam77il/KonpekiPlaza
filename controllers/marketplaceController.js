import express from "express";
import db from "../utils/db.js";
import { tryToAddItemToUser } from "./agentController.js";

const router = express.Router();

// Get marketplace items
router.get("/api/marketplace", (req, res) => {
  // if (!req.session.user) {
  //   res.status(401).json({ success: false, message: "Not logged in." });
  //   return;
  // }

  try {
    db.query(
      `SELECT 
  marketplace.id,
  marketplace.amount,
  marketplace.price,

  users.id AS user_id,
  users.username,

  items.id AS item_id,
  items.label,
  items.img

FROM marketplace

JOIN users 
  ON marketplace.seller_id = users.id

JOIN items 
  ON marketplace.item_id = items.id`,
      [],
      (err, results) => {
        if (err) {
          console.log("Error fetching marketplace data: ", err);
          res.status(500).json({
            success: false,
            message: "Error fetching marketplace items data",
          });
          return;
        }

        if (results.length === 0) {
          res.status(200).json({ success: true, message: "NIF" });
          return;
        }
        console.log(results);
        res.status(201).json({ success: true, items: results });
      },
    );
  } catch (error) {
    console.log("Error fetching marketplace data:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching marketplace data" });
  }
});

// Add item to marketplace
router.post("/api/marketplace/additem", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: "Not logged in.",
    });
  }

  const { item } = req.body;
  const userId = req.session.user.id;

  if (!item || !item.id || !item.amount || !item.price) {
    return res.status(400).json({
      success: false,
      message: "Invalid item data.",
    });
  }

  db.query(
    "SELECT amount, item_id FROM user_items WHERE user_id = ? AND id = ?",
    [userId, item.id],
    (err, results) => {
      if (err) {
        console.log("Error fetching user item:", err);
        return res.status(500).json({
          success: false,
          message: "Error fetching user item data",
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Item not found",
        });
      }

      const dbItem = results[0];

      if (dbItem.amount < item.amount) {
        return res.status(400).json({
          success: false,
          message: "Not enough items available",
        });
      }

      db.query(
        "INSERT INTO marketplace (seller_id, item_id, amount, price) VALUES (?, ?, ?, ?)",
        [userId, dbItem.item_id, item.amount, item.price],
        (err, result) => {
          if (err) {
            console.log("Error inserting marketplace item:", err);
            return res.status(500).json({
              success: false,
              message: "Error inserting marketplace item",
            });
          }

          // remove items from player inventory
          db.query(
            "UPDATE user_items SET amount = amount - ? WHERE user_id = ? AND item_id = ?",
            [item.amount, userId, dbItem.item_id],
            (err, _) => {
              if (err) {
                console.log("Error updating user item:", err);
                return res.status(500).json({
                  success: false,
                  message: "Error updating user item data",
                });
              }
            },
          );

          return res.status(201).json({
            success: true,
            message: "Item listed successfully",
            marketplaceId: result.insertId,
          });
        },
      );
    },
  );
});

// Buy item from marketplace
router.post("/api/marketplace/buy/:marketplaceId/:amount", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: "Not logged in.",
    });
  }

  const { marketplaceId, amount } = req.params;
  const userId = req.session.user.id;

  db.query(
    "SELECT * FROM marketplace WHERE id = ?",
    [marketplaceId],
    async (err, results) => {
      if (err) {
        console.log("Error fetching marketplace item:", err);
        return res.status(500).json({
          success: false,
          message: "Error fetching marketplace item data",
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Marketplace item not found",
        });
      }

      const marketItem = results[0];

      if (marketItem.amount < amount) {
        return res.status(400).json({
          success: false,
          message: "Not enough items available",
        });
      }

      const success = await tryToAddItemToUser(
        req.session,
        marketItem.item_id,
        amount,
        marketItem.price * amount,
      );

      if (!success) {
        return res.status(400).json({
          success: false,
          message: "Not enough Eurodollars",
        });
      }

      db.query(
        "UPDATE marketplace SET amount = amount - ? WHERE id = ?",
        [amount, marketplaceId],
        (err, _) => {
          if (err) {
            console.log("Error updating marketplace item:", err);
            return res.status(500).json({
              success: false,
              message: "Error updating marketplace item data",
            });
          }

          if (marketItem.amount - amount <= 0) {
            db.query(
              "DELETE FROM marketplace WHERE id = ?",
              [marketplaceId],
              (err, _) => {
                if (err) {
                  console.log("Error deleting marketplace item:", err);
                  return res.status(500).json({
                    success: false,
                    message: "Error deleting marketplace item data",
                  });
                }
              },
            );
          }

          db.query(
            "UPDATE users SET eurodollar = eurodollar + ? WHERE id = ?",
            [marketItem.price * amount, marketItem.seller_id],
            (err, _) => {
              if (err) {
                console.log("Error updating seller eurodollar:", err);
                return res.status(500).json({
                  success: false,
                  message: "Error updating seller eurodollar data",
                });
              }
            },
          );

          return res.status(200).json({
            success: true,
            message: "Item bought successfully",
          });
        },
      );
    },
  );
});

// Get specific marketplace item
router.get("/api/marketplace/:marketplaceId", (req, res) => {
  const { marketplaceId } = req.params;

  db.query(
    "SELECT marketplace.*, items.label FROM marketplace JOIN items ON marketplace.item_id = items.id WHERE marketplace.id = ?",
    [marketplaceId],
    (err, results) => {
      if (err) {
        console.log("Error fetching marketplace item:", err);
        return res.status(500).json({
          success: false,
          message: "Error fetching marketplace item data",
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Marketplace item not found",
        });
      }

      return res.status(200).json({
        success: true,
        item: results[0],
      });
    },
  );
});

export default router;
