import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });
const uploadToCloudinary = async (localfilePath) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    if (!localfilePath) {
      console.log(localfilePath);
      return null;
    }
    const response = await cloudinary.uploader.upload(localfilePath, {
      resource_type: "auto",
    });
    console.log("respones of a cloudinary", response);
    console.log("the response image url", response.url);
    fs.unlinkSync(localfilePath);
    return response;
  } catch (e) {
    fs.unlinkSync(localfilePath);
    return null;
  }
};
export { uploadToCloudinary };
