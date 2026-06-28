import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;

    if (req.baseUrl.includes("/foods")) {
      uploadPath = path.join(process.cwd(), "uploads", "foods");
    } else if (req.baseUrl.includes("/user")) {
      uploadPath = path.join(process.cwd(), "uploads", "users");
    } else {
      return cb(new Error("Invalid path route"));
    }

    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
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
