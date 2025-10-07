import fs from "fs";
import { cloudinary } from "./cloudinary-confiure.js";

const uploadToCloudinary = async (localfilePath) => {
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

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      console.log("No public ID provided for deletion");
      return null;
    }

    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Cloudinary delete result:", result);
    return result;
  } catch (error) {
    console.log("Error deleting from cloudinary:", error);
    return null;
  }
};

export { deleteFromCloudinary, uploadToCloudinary };
