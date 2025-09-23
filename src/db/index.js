import mongoose from "mongoose";
import { db_name } from "../constants.js";

async function connectionDB() {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${db_name}`
    );
    console.log(
      `\n MongoDB connected!! DB  HOST ${connectionInstance.connection.host}`
    );
  } catch (e) {
    console.log("Error ocurred when connecting to DB", e);
    process.exit(1);
  }
}
export default connectionDB;
