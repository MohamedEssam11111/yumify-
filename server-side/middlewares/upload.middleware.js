import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// نحدد مسار مجلد الـ uploads ليكون داخل مجلد السيرفر (server-side/uploads)
// __dirname هنا هي مجلد الـ middleware، لذا نخرج منه خطوة واحدة للـ server-side
const UPLOADS_ROOT = path.resolve(__dirname, "../uploads");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;

    // تحديد المجلد الفرعي بناءً على الـ route
    if (req.baseUrl.includes("/foods")) {
      uploadPath = path.join(UPLOADS_ROOT, "foods");
    } else if (req.baseUrl.includes("/user")) {
      uploadPath = path.join(UPLOADS_ROOT, "users");
    } else {
      return cb(new Error("Invalid path route"));
    }

    // إنشاء المجلد تلقائياً إذا لم يكن موجوداً
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    // إنشاء اسم فريد للملف باستخدام الوقت الحالي
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // حد أقصى 5 ميجابايت

  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|webp/;
    const extname = path.extname(file.originalname).toLowerCase();
    const mimetype = fileTypes.test(file.mimetype);

    if (fileTypes.test(extname) && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed (jpeg, jpg, png, webp)"));
    }
  },
});

export default upload;
