import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3 from "./s3.client.js";

const deleteFromS3 = async (imageUrl) => {
  if (!imageUrl) return;

  try {
    const url = new URL(imageUrl);

    const key = decodeURIComponent(url.pathname.substring(1));

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,

      Key: key,
    });

    await s3.send(command);
  } catch (error) {
    console.error("Failed to delete image from S3:", error);
  }
};

export default deleteFromS3;
