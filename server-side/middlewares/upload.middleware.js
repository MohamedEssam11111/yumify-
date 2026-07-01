import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER?.toLowerCase() || "local";

const UPLOADS_ROOT = path.resolve(__dirname, "../uploads");

// ======================
// Local Disk Storage
// ======================

const diskStorage = multer.diskStorage({
  destination(req, file, cb) {
    let uploadPath;

    if (req.baseUrl.includes("/foods")) {
      uploadPath = path.join(UPLOADS_ROOT, "foods");
    } else if (req.baseUrl.includes("/user")) {
      uploadPath = path.join(UPLOADS_ROOT, "users");
    } else {
      return cb(new Error("Invalid upload route."));
    }

    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },

  filename(req, file, cb) {
    const ext = path.extname(file.originalname);

    cb(null, `${Date.now()}${ext}`);
  },
});

// ======================
// Select Storage Provider
// ======================

const storage =
  STORAGE_PROVIDER === "s3" ? multer.memoryStorage() : diskStorage;

// ======================
// Multer Instance
// ======================

export const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter(req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|webp/;

    const ext = path.extname(file.originalname).toLowerCase();

    const mimeAllowed = allowedTypes.test(file.mimetype);
    const extAllowed = allowedTypes.test(ext);

    if (mimeAllowed && extAllowed) {
      return cb(null, true);
    }

    cb(new Error("Only jpeg, jpg, png and webp images are allowed."));
  },
});

export default upload;
