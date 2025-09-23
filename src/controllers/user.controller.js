// g
import { asyncHandaller } from "../utills/asyncHandaller.js";
const registerController = asyncHandaller(async (req, res) => {
  res.status(200).json({
    message: "",
  });
});
export { registerController };
