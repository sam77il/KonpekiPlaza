import express from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import db from "../utils/db.js";

const router = express.Router();

function checkIfUserExists(username, email) {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email],
      (err, results) => {
        if (err) {
          console.error("Error checking user existence:", err);
          reject(err);
        }
        resolve(results.length > 0);
      },
    );
  });
}

router.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        console.error("Error during login:", err);
        res.status(500).json({ success: false, message: "Error during login" });
        return;
      }

      if (results.length === 0) {
        res
          .status(400)
          .json({ success: false, message: "Invalid credentials" });
        return;
      }
      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        res
          .status(400)
          .json({ success: false, message: "Invalid credentials" });
        return;
      }

      const finalUser = {
        id: user.id,
        username: user.username,
        email: user.email,
      };
      req.session.user = finalUser;
      res.json({ success: true, message: "Login successful", user: finalUser });
    },
  );
});

router.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = uuidv4();
  const userExists = await checkIfUserExists(username, email);
  if (userExists) {
    res
      .status(400)
      .json({ success: false, message: "Username or email already exists" });
    return;
  }

  db.query(
    "INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)",
    [userId, username, email, hashedPassword],
    (err, result) => {
      if (err) {
        console.error("Error registering user:", err);
        res
          .status(500)
          .json({ success: false, message: "Error registering user" });
        return;
      }
      res
        .status(201)
        .json({ success: true, message: "User registered successfully" });
    },
  );
});

router.get("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err);
      res.status(500).json({ success: false, message: "Error during logout" });
      return;
    }
    res.json({ success: true, message: "Logout successful" });
  });
});

router.get("/api/auth/ping", (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

export default router;
