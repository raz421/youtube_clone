import multer from "multer";
import path from "path";

const sanitizeBaseName = (name = "") =>
  name
    .replace(/\.[^/.]+$/, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .toLowerCase()
    .slice(0, 40) || "file";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname || "");
    const baseName = sanitizeBaseName(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${baseName}-${uniqueSuffix}${extension}`);
  },
});

const upload = multer({ storage: storage });
export { upload };
