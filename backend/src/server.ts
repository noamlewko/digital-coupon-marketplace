import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectMongo } from "./db/mongo";
import { bearerAuth } from "./middlewares/bearerAuth";
import { errorHandler } from "./middlewares/errorHandler";

import resellerRoutes from "./routes/reseller.routes";
import adminRoutes from "./routes/admin.routes";
import customerRoutes from "./routes/customer.routes";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

// Reseller API (requires RESELLER_TOKEN)
app.use("/api/v1", bearerAuth("RESELLER_TOKEN"), resellerRoutes);

// Admin API (requires ADMIN_TOKEN)
app.use("/admin", bearerAuth("ADMIN_TOKEN"), adminRoutes);

// Customer API (requires CUSTOMER_TOKEN)
app.use("/customer", customerRoutes);

// Error handler must be last
app.use(errorHandler);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const MONGO_URI = process.env.MONGO_URI;

async function main() {
  if (!MONGO_URI) throw new Error("Missing MONGO_URI in .env");
  await connectMongo(MONGO_URI);

  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});