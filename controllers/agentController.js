import express from "express";
import db from "../utils/db.js";

const router = express.Router();

// Get agent items
router.get("/api/agents/:agent", (req, res) => {
  const { agent } = req.params;

  try {
    db.query(
      "SELECT agents.*, items.* FROM agents JOIN items on agents.item_id = items.id WHERE agents.agent = ?",
      [agent],
      (err, results) => {
        if (err) {
          console.log("Error fetching agent data: ", err);
          res
            .status(500)
            .json({ success: false, message: "Error fetching agent data" });
          return;
        }

        if (results.length === 0) {
          res.status(404).json({ success: false, message: "Agent not found" });
          return;
        }

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

// Get specific agent item
router.post("/api/agents/buy/:agentId/:amount", async (req, res) => {
  const { amount, agentId } = req.params;

  if (!req.session.user) {
    res.status(401).json({ success: false, message: "Not logged in" });
    return;
  }
  try {
    db.query(
      "SELECT * FROM agents WHERE id = ?",
      [agentId],
      async (err, results) => {
        if (err) {
          res.status(401).json({ success: false, message: "Item not found" });
          return;
        }

        if (results.length === 1) {
          if (results[0].amount >= amount) {
            const price = Number(results[0].price) * Number(amount);
            const success = await tryToAddItemToUser(
              req.session,
              results[0].item_id,
              amount,
              price,
            );

            if (success) {
              db.query(
                "UPDATE agents SET amount = amount - ? WHERE id = ?",
                [Number(amount), agentId],
                (err2) => {
                  if (err2) {
                    return res
                      .status(500)
                      .json({ success: false, message: "Item update failed" });
                  }

                  return res.status(201).json({
                    success: true,
                    message: "Items successfully bought",
                  });
                },
              );
            } else {
              res
                .status(401)
                .json({ success: false, message: "Something went wrong" });
              return;
            }
          } else {
            res
              .status(401)
              .json({ success: false, message: "Item amount invalid" });

            return;
          }
        }
      },
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "DB error" });
  }
});

// Helper functions
export function tryToAddItemToUser(session, itemId, amount, price) {
  return new Promise(async (resolve, reject) => {
    const hasEnoughEuroDollar = await doesUserHasEnoughEuroDollar(
      session,
      price,
    );
    console.log("Has enough Dollar", hasEnoughEuroDollar);
    if (!hasEnoughEuroDollar) reject(false);

    const removedEuroDollar = await removeUserEurodollar(session, price);
    console.log("Removed?", removedEuroDollar);

    if (!removedEuroDollar) reject(false);

    const addedItemToUser = await addItemToUser(session, itemId, amount);
    console.log("Added?", addedItemToUser);

    if (!addItemToUser) return reject(false);

    return resolve(true);
  });
}

function addItemToUser(session, itemId, amount) {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM user_items WHERE user_id = ? AND item_id = ?",
      [session.user.id, itemId],
      (err, results) => {
        if (err) {
          console.log(err);
          return reject(false);
        }

        if (results.length >= 1) {
          console.log("found itemmmm");
          db.query(
            "UPDATE user_items SET amount = amount + ? WHERE user_id = ? AND item_id = ?",
            [amount, session.user.id, itemId],
            (err2, results2) => {
              if (err2) {
                console.log(err2);
                return reject(false);
              }

              return resolve(true);
            },
          );
        } else {
          console.log("not found itemmmm");

          db.query(
            "INSERT INTO user_items (user_id, item_id, amount) VALUES (?, ?, ?)",
            [session.user.id, itemId, amount],
            (err3, results3) => {
              if (err3) {
                console.log(err3);
                reject(err3);
              }

              return resolve(true);
            },
          );
        }
      },
    );
  });
}

function removeUserEurodollar(session, amount) {
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE users SET eurodollar = eurodollar - ? WHERE id = ?",
      [amount, session.user.id],
      (err, results) => {
        if (err) {
          console.log(err);
          return reject(false);
        }

        session.user.eurodollar = session.user.eurodollar - amount;
        return resolve(true);
      },
    );
  });
}

function doesUserHasEnoughEuroDollar(session, needMoney) {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT eurodollar FROM users WHERE id = ?",
      [session.user.id],
      (err, results) => {
        if (err) {
          console.log(err);
          return reject(false);
        }

        if (
          results.length === 1 &&
          Number(results[0].eurodollar) >= Number(needMoney)
        ) {
          session.user.eurodollar = Number(results[0].eurodollar);
          return resolve(true);
        }

        return resolve(false);
      },
    );
  });
}

// get agent item data
router.get("/api/agents/:agent/items/:itemId", async (req, res) => {
  const { agent, itemId } = req.params;

  if (!req.session.user) {
    res.status(401).json({ success: false, message: "Not logged in" });
    return;
  }

  try {
    db.query(
      "SELECT agents.id, agents.agent, items.label, items.img, agents.amount, agents.price, agents.item_id FROM agents JOIN items ON items.id = agents.item_id WHERE agents.item_id = ? AND agents.agent = ?",
      [itemId, agent],
      (err, results) => {
        if (err) {
          console.log(err);
          return;
        }

        if (results.length === 1) {
          res.status(201).json({ success: true, item: results[0] });
          return;
        }

        res.status(401).json({ success: false, message: "Unknown Error" });
      },
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "DB error" });
  }
});

export default router;
