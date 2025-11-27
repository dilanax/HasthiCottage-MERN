# Azure Cloud Storage Integration

This document explains how the Azure cloud storage integration works for Safari packages and Food menu items.

## Environment Variables Required

Add these variables to your `.env` file:

```env
AZURE_STORAGE_CONNECTION_STRING=your_azure_storage_connection_string_here
AZURE_CONTAINER_NAME=your_container_name_here
```

## Features Implemented

### 1. Safari Package Image Upload
- Images are uploaded to Azure Blob Storage under `safari-packages/` folder
- Each package gets its own subfolder: `safari-packages/{packageId}/`
- Image URLs are stored in MongoDB instead of local file paths

### 2. Food Menu Image Upload
- Images are uploaded to Azure Blob Storage under `food-menu/` folder
- Each menu item gets its own subfolder: `food-menu/{menuId}/`
- Image URLs are stored in MongoDB instead of local file paths

### 3. Image Management
- **Create**: Upload new images to Azure and save URL to MongoDB
- **Update**: Upload new image, delete old image from Azure, update URL in MongoDB
- **Delete**: Delete image from Azure when deleting the record

## File Structure in Azure

```
your-container/
├── safari-packages/
│   ├── {packageId}/
│   │   └── {timestamp}-{filename}.{ext}
│   └── {timestamp}-{filename}.{ext}
└── food-menu/
    ├── {menuId}/
    │   └── {timestamp}-{filename}.{ext}
    └── {timestamp}-{filename}.{ext}
```

## API Endpoints

### Safari Packages
- `POST /api/packages` - Create package with image
- `PUT /api/packages/:id` - Update package with new image
- `DELETE /api/packages/:id` - Delete package and its image

### Food Menu Items
- `POST /api/menu-items` - Create menu item with image
- `PUT /api/menu-items/:id` - Update menu item with new image
- `DELETE /api/menu-items/:id` - Delete menu item and its image

## Supported Image Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

## File Size Limit
- Maximum file size: 5MB per image

## Error Handling
- Invalid file types are rejected
- File size exceeding limit is rejected
- Azure upload failures are handled gracefully
- Old images are properly deleted when updating/deleting records






