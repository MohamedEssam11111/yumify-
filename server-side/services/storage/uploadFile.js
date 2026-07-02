import uploadToS3 from "./uploadToS3.js";
import env from "../../config/env.js";
const STORAGE_PROVIDER = env.STORAGE_PROVIDER?.toLowerCase() || "local";

const uploadFile = async (file, folder) => {
  if (!file) return null;

  if (STORAGE_PROVIDER === "s3") {
    return await uploadToS3(file, folder);
  }

  // Local storage
  return file.filename;
};

export default uploadFile;
