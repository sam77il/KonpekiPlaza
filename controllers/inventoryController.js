import express from "express";
import db from "../utils/db.js";

const router = express.Router();

router.get("/api/inventory", (req, res) => {
  if (!req.session.user) {
    res.status(401).json({ success: false, message: "Not logged in." });
    return;
  }

  try {
    const userId = req.session.user.id;
    db.query(
      "SELECT user_items.amount, users.id AS user_id, users.username, users.email, items.id AS item_id, items.label, items.img FROM user_items JOIN users ON user_items.user_id = users.id JOIN items ON user_items.item_id = items.id WHERE user_items.user_id = ?",
      [userId],
      (err, results) => {
        if (err) {
          console.log("Error fetching agent data: ", err);
          res.status(500).json({
            success: false,
            message: "Error fetching user items data",
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
    console.log("Error fetching agent data:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching agent data" });
  }
});

export default router;
