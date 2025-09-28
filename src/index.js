import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import app from "./app.js";
import connectionDB from "./db/index.js";
const port = process.env.PORT || 5000;
connectionDB()
  .then(() => {
    app.listen(port, () => {
      console.log("app is listening on port", port);
    });
  })
  .catch((e) => {
    console.log("MongoDB connection failed!!", e);
  });
