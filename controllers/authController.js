import express from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import db from "../utils/db.js";

const router = express.Router();

// Helper function to check if username or email already exists
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

// Login route
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
        eurodollar: user.eurodollar,
      };
      req.session.user = finalUser;
      res.json({ success: true, message: "Login successful", user: finalUser });
    },
  );
});

// Registration route
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

// Logout route
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

// Update username route
router.post("/api/update-username", async (req, res) => {
  if (!req.session.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const { username } = req.body;
  const nameExists = await checkIfUserExists(username, null);
  if (nameExists) {
    res
      .status(400)
      .json({ success: false, message: "Username already exists" });
    return;
  }

  db.query(
    "UPDATE users SET username = ? WHERE id = ?",
    [username, req.session.user.id],
    (err, result) => {
      if (err) {
        console.error("Error updating username:", err);
        res
          .status(500)
          .json({ success: false, message: "Error updating username" });
        return;
      }
      req.session.user.username = username;
      res.json({ success: true, message: "Username updated successfully" });
    },
  );
});

// Update email route
router.post("/api/update-email", async (req, res) => {
  if (!req.session.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const { email } = req.body;
  const emailExists = await checkIfUserExists(null, email);
  if (emailExists) {
    res.status(400).json({ success: false, message: "Email already exists" });
    return;
  }

  db.query(
    "UPDATE users SET email = ? WHERE id = ?",
    [email, req.session.user.id],
    (err, result) => {
      if (err) {
        console.error("Error updating email:", err);
        res
          .status(500)
          .json({ success: false, message: "Error updating email" });
        return;
      }
      req.session.user.email = email;
      res.json({ success: true, message: "Email updated successfully" });
    },
  );
});

// Update password route
router.post("/api/update-password", async (req, res) => {
  if (!req.session.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const { oldPassword, newPassword } = req.body;

  if (newPassword.length < 6) {
    res.status(400).json({
      success: false,
      message: "New password must be at least 6 characters long",
    });
    return;
  }

  db.query(
    "SELECT password FROM users WHERE id = ?",
    [req.session.user.id],
    (err, result) => {
      if (err) {
        console.error("Error updating password:", err);
        res
          .status(500)
          .json({ success: false, message: "Error updating password" });
        return;
      }
      if (result.length === 0) {
        res.status(400).json({ success: false, message: "User not found" });
        return;
      }

      const hashedPassword = result[0].password;
      bcrypt.compare(oldPassword, hashedPassword, async (err, isMatch) => {
        if (err) {
          console.error("Error comparing passwords:", err);
          res
            .status(500)
            .json({ success: false, message: "Error updating password" });
          return;
        }
        if (!isMatch) {
          res
            .status(400)
            .json({ success: false, message: "Current password is incorrect" });
          return;
        }
        const newHashedPassword = await bcrypt.hash(newPassword, 10);
        db.query(
          "UPDATE users SET password = ? WHERE id = ?",
          [newHashedPassword, req.session.user.id],
          (err, result) => {
            if (err) {
              console.error("Error updating password:", err);
              res
                .status(500)
                .json({ success: false, message: "Error updating password" });
              return;
            }
            res.json({
              success: true,
              message: "Password updated successfully",
            });
          },
        );
      });
    },
  );
});

// Ping route to check if user is logged in and get user current data
router.get("/api/auth/ping", (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

export default router;
