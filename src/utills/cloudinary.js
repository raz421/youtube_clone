import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadToCloudinary = async (localfilePath) => {
  try {
    if (!localfilePath) return;
    const response = await cloudinary.uploader.upload(localfilePath, {
      resource_type: "auto",
    });
    console.log("successfully upload in cloudinary", response.url);
    console.log(response);
    return response;
  } catch (e) {
    fs.unlinkSync(localfilePath);
    return null;
  }
};
export { uploadToCloudinary };
