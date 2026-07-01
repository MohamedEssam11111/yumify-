import API_URL from "../src/config/api"; // or wherever you export your API url

const getImageUrl = (imageUrl, folder = "foods") => {
  if (!imageUrl) {
    return "/placeholder.png";
  }

  // S3 or any external storage
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // Local storage
  return `${API_URL}/uploads/${folder}/${imageUrl}`;
};

export default getImageUrl;
