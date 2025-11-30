
import multer from "multer"; // Import Multer for handling file uploads
import path from "path"; // Import path module for handling file paths



const storage = multer.diskStorage({ // Configure storage settings for Multer
  destination: function (req, file, cb) { // cb is callback function to specify destination
    if(req.baseUrl.includes('/foods')) {
        cb(null, "uploads/foods"); // Save food images to uploads/foods directory
    } else if (req.baseUrl.includes('/user')) {
        cb(null, "uploads/users"); // Save user avatars to uploads/avatars directory
  }else {
        cb(new Error('invalid path route')); 
    }

},

  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Specify the filename for uploaded files
  },
});

export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|webp/; // Allowed file types
    const extname = path.extname(file.originalname).toLowerCase(); // Get file extension
    // mimetype check is to ensure the file content matches the extension
    if (fileTypes.test(extname) && fileTypes.test(file.mimetype)) {// Check if file type is allowed
      cb(null, true); // Accept file
  }else {
      cb(new Error("Only images are allowed (jpeg, jpg, png)")); // Reject file
    }
  },
 }); // Create Multer instance with defined storage settings


export default upload;