import mongoose from "mongoose";
import { db_name } from "../constants.js";

async function connectionDB() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";

    if (!mongoUri) {
      throw new Error("MONGO_URI is not configured");
    }

    const connectionInstance = await mongoose.connect(`${mongoUri}/${db_name}`);
    console.log(
      `\n MongoDB connected!! DB  HOST ${connectionInstance.connection.host}`
    );
  } catch (e) {
    console.error("Error occurred when connecting to DB", e);
    process.exit(1);
  }
}
export default connectionDB;
