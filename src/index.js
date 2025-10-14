import dotenv from "dotenv";
import app from "./app.js";
import connectionDB from "./db/index.js";
dotenv.config({ path: "./.env" });
const port = process.env.PORT || 5000;
connectionDB()
  .then(() => {
    app
      .listen(port, () => {
        console.log("app is listening on port", port);
      })
      .on("error", (e) => {
        console.log("Error occurred while starting the server", e);
      });
  })
  .catch((e) => {
    console.log("MongoDB connection failed!!", e);
  });
