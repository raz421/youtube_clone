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
  return `${getServerBaseUrl()}/temp/${encodeURIComponent(fileName)}`;
};

const normalizeMediaUrl = (value) => {
  if (!value || typeof value !== "string") {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    try {
      const parsedUrl = new URL(value);
      const isLocalHost =
        parsedUrl.hostname === "localhost" ||
        parsedUrl.hostname === "127.0.0.1";

      if (isLocalHost && parsedUrl.pathname.startsWith("/temp/")) {
        return `${getServerBaseUrl()}${parsedUrl.pathname}`;
      }

      return value;
    } catch (_error) {
      return value;
    }
  }

  const normalizedPath = value.replace(/\\/g, "/");

  if (normalizedPath.startsWith("/temp/")) {
    return `${getServerBaseUrl()}${normalizedPath}`;
  }

  if (
    normalizedPath.startsWith("temp/") ||
    normalizedPath.startsWith("public/temp/") ||
    normalizedPath.includes("/public/temp/")
  ) {
    return getTempFileUrl(normalizedPath);
  }

  if (normalizedPath.startsWith("/")) {
    return `${getServerBaseUrl()}${normalizedPath}`;
  }

  return value;
};

const isCloudinaryUrl = (value) => {
  if (!value || typeof value !== "string") {
    return false;
  }

  return /(^https?:\/\/)?(?:res\.)?cloudinary\.com\//i.test(value);
};

const extractCloudinaryPublicId = (value) => {
  if (!isCloudinaryUrl(value)) {
    return null;
  }

  try {
    const parsed = new URL(value);
    const pathname = parsed.pathname;
    const uploadMarker = "/upload/";
    const uploadIndex = pathname.indexOf(uploadMarker);

    if (uploadIndex === -1) {
      return null;
    }

    let publicPath = pathname.slice(uploadIndex + uploadMarker.length);

    // Strip optional transformation/version segments before public id.
    const segments = publicPath.split("/").filter(Boolean);
    const versionIndex = segments.findIndex((segment) =>
      /^v\d+$/.test(segment)
    );
    if (versionIndex === -1 || versionIndex === segments.length - 1) {
      return null;
    }

    const publicIdWithExt = segments.slice(versionIndex + 1).join("/");
    const publicId = publicIdWithExt.replace(/\.[^/.?]+$/, "");

    return publicId || null;
  } catch (_error) {
    return null;
  }
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

    if (!hasCloudinaryConfig()) {
      console.log("Cloudinary is not configured; skipping delete");
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

export {
  deleteFromCloudinary,
  extractCloudinaryPublicId,
  normalizeMediaUrl,
  uploadToCloudinary,
};
