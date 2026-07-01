import { PutObjectCommand } from "@aws-sdk/client-s3";
import path from "path";
import s3 from "./s3.client.js";

const uploadToS3 = async (file, folder = "foods") => {
  if (!file) return null;

  const extension = path.extname(file.originalname);

  const key = `${folder}/${Date.now()}${extension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,

    Key: key,

    Body: file.buffer,

    ContentType: file.mimetype,
  });

  await s3.send(command);

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

export default uploadToS3;
