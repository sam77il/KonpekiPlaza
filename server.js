import express from "express";
import session from "express-session";
import cors from "cors";
import authController from "./controllers/authController.js";
import agentController from "./controllers/agentController.js";
import inventoryController from "./controllers/inventoryController.js";
import marketplaceController from "./controllers/marketplaceController.js";
import db from "./utils/db.js";
import path from "path";
import { fileURLToPath } from "url";
import cron from "node-cron";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5030;

app.use(express.static(path.join(__dirname, "frontend")));

app.use(express.json());
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: "lax",
    },
  }),
);
app.use(
  cors({
    origin: "http://127.0.0.1:5030",
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

// Function to update agent prices hourly
const updateAgentPrices = () => {
  db.query("SELECT id, price FROM agents", (err, results) => {
    if (err) {
      console.error("Error fetching agents:", err);
      return;
    }

    results.forEach((agent) => {
      // Change price by -20% to +20%
      const changePercent = (Math.random() - 0.5) * 0.4; // -0.2 to 0.2
      const newPrice = Math.max(
        1,
        Math.floor(agent.price * (1 + changePercent)),
      ); // Ensure price >= 1
      db.query(
        "UPDATE agents SET price = ? WHERE id = ?",
        [newPrice, agent.id],
        (updateErr) => {
          if (updateErr) {
            console.error(
              "Error updating price for agent",
              agent.id,
              updateErr,
            );
          }
        },
      );
    });

    console.log("Agent prices updated at", new Date().toISOString());
  });
};

// Schedule the price update every hour at the top of the hour
cron.schedule("0 * * * *", updateAgentPrices);

app.use(authController);
app.use(agentController);
app.use(inventoryController);
app.use(marketplaceController);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
