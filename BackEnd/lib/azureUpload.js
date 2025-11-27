import { BlobServiceClient } from "@azure/storage-blob";
import multer from "multer";
import path from "path";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_CONTAINER_NAME;

if (!connectionString || !containerName) {
  throw new Error("Azure storage configuration missing in .env");
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

// Multer memory storage
const storage = multer.memoryStorage();
export const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Upload file for Safari Packages
export const uploadPackageImage = async (file, packageId = null) => {
  const timestamp = Date.now();
  const fileName = packageId
    ? `safari-packages/${packageId}/${timestamp}-${path.basename(file.originalname)}`
    : `safari-packages/${timestamp}-${path.basename(file.originalname)}`;

  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  await blockBlobClient.upload(file.buffer, file.buffer.length);
  return blockBlobClient.url;
};

// Upload file for Food Menu Items
export const uploadMenuImage = async (file, menuId = null) => {
  const timestamp = Date.now();
  const fileName = menuId
    ? `food-menu/${menuId}/${timestamp}-${path.basename(file.originalname)}`
    : `food-menu/${timestamp}-${path.basename(file.originalname)}`;

  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  await blockBlobClient.upload(file.buffer, file.buffer.length);
  return blockBlobClient.url;
};

// Generic upload function
export const uploadToAzure = async (file, folder, itemId = null) => {
  const timestamp = Date.now();
  const fileName = itemId
    ? `${folder}/${itemId}/${timestamp}-${path.basename(file.originalname)}`
    : `${folder}/${timestamp}-${path.basename(file.originalname)}`;

  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  await blockBlobClient.upload(file.buffer, file.buffer.length);
  return blockBlobClient.url;
};

// Delete file from Azure
export const deleteFromAzure = async (url) => {
  try {
    // Extract blob name from URL
    const urlParts = url.split('/');
    const blobName = urlParts.slice(4).join('/'); // Remove domain and container name
    
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
    return true;
  } catch (error) {
    console.error('Error deleting file from Azure:', error);
    return false;
  }
};

// Extract blob name from URL for deletion
export const extractBlobName = (url) => {
  const urlParts = url.split('/');
  return urlParts.slice(4).join('/'); // Remove domain and container name
};

export { blobServiceClient };
