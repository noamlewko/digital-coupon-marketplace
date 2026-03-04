import mongoose from "mongoose";

/**
 * MongoDB connection helper.
 */
export async function connectMongo(uri: string) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
}