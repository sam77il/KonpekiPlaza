import express from "express";
import session from "express-session";
import cors from "cors";
import authController from "./controllers/authController.js";
import agentController from "./controllers/agentController.js";
import inventoryController from "./controllers/inventoryController.js";
import db from "./utils/db.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "frontend")));

app.use(express.json());
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      sameSite: "lax", // Set to "lax" or "strict" if not using cross-site cookies
    },
  }),
);
app.use(
  cors({
    origin: "http://127.0.0.1:8080",
    credentials: true,
  }),
);

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

app.use(authController);
app.use(agentController);
app.use(inventoryController);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
