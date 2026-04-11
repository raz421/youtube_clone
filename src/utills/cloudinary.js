import fs from "fs";
import path from "path";
import { cloudinary } from "./cloudinary-confiure.js";

const hasCloudinaryConfig = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

const getServerBaseUrl = () =>
  process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

const getTempFileUrl = (localFilePath) => {
  const fileName = path.basename(localFilePath);
  return `${getServerBaseUrl()}/temp/${fileName}`;
};

const safeUnlink = (localFilePath) => {
  if (localFilePath && fs.existsSync(localFilePath)) {
    fs.unlinkSync(localFilePath);
  }
};

const uploadToCloudinary = async (localfilePath) => {
  try {
    if (!localfilePath) {
      console.log(localfilePath);
      return null;
    }

    // In local/dev setups without Cloudinary keys, keep the file and serve it from /public/temp.
    if (!hasCloudinaryConfig()) {
      return {
        url: getTempFileUrl(localfilePath),
      };
    }

    const response = await cloudinary.uploader.upload(localfilePath, {
      resource_type: "auto",
    });
    const normalizedResponse = {
      ...response,
      url: response?.secure_url || response?.url,
    };

    console.log("respones of a cloudinary", normalizedResponse);
    console.log("the response image url", normalizedResponse.url);
    safeUnlink(localfilePath);
    return normalizedResponse;
  } catch (e) {
    // If Cloudinary upload fails, fallback to local static file URL for better local DX.
    console.log(
      "Cloudinary upload failed, falling back to local file URL",
      e?.message
    );
    return {
      url: getTempFileUrl(localfilePath),
    };
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
