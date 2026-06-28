import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Go from server-side/middleware -> project root
const ROOT_DIR = path.resolve(__dirname, "../../");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;

    if (req.baseUrl.includes("/foods")) {
      uploadPath = path.join(ROOT_DIR, "uploads", "foods");
    } else if (req.baseUrl.includes("/user")) {
      uploadPath = path.join(ROOT_DIR, "uploads", "users");
    } else {
      return cb(new Error("Invalid path route"));
    }

    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },

  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|webp/;
    const extname = path.extname(file.originalname).toLowerCase();

    if (fileTypes.test(extname) && fileTypes.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed (jpeg, jpg, png, webp)"));
    }
  },
});

export default upload;
