import deleteFromS3 from "./deleteFromS3.js";
import env from "../../config/env.js";
const STORAGE_PROVIDER = env.STORAGE_PROVIDER?.toLowerCase() || "local";

const deleteFile = async (imageUrl) => {
  if (!imageUrl) return;

  if (STORAGE_PROVIDER === "s3") {
    await deleteFromS3(imageUrl);
  }

  // Local deletion will be added later.
};

export default deleteFile;
