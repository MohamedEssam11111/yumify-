import API_URL from "../src/config/api";

const getImageUrl = (imageUrl, folder = "foods") => {
  if (!imageUrl) {
    return "/placeholder.png";
  }

  // Already an external URL (S3, CloudFront, etc.)
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // If one day you decide to store "/uploads/foods/file.jpg"
  // instead of only "file.jpg", this will still work.
  if (imageUrl.startsWith("/uploads")) {
    return `${API_URL}${imageUrl}`;
  }

  // Local storage (current behavior)
  return `${API_URL}/uploads/${folder}/${imageUrl}`;
};

export default getImageUrl;
