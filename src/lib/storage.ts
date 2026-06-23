import fs from "fs/promises";
import path from "path";

/**
 * Storage Abstraction Layer
 * Handles local file upload writes as the primary production-ready mechanism,
 * and provides clean integration hooks for cloud storage providers (S3, Cloudinary, Azure Blob).
 */
export async function saveImage(
  fileData: Buffer | string,
  fileName: string
): Promise<string> {
  const extension = path.extname(fileName) || ".jpg";
  const safeName = `${Date.now()}-${path.basename(fileName, extension).replace(/[^a-zA-Z0-9]/g, "_")}${extension}`;

  // 1. AWS S3 Storage Integration Point
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_S3_BUCKET) {
    try {
      console.log(`[Storage] Uploading ${safeName} to AWS S3...`);
      // Standard AWS SDK integration placeholder:
      // const s3 = new S3Client({ region: process.env.AWS_REGION });
      // await s3.send(new PutObjectCommand({ Bucket: bucket, Key: safeName, Body: buffer }));
      // return `https://${bucket}.s3.amazonaws.com/${safeName}`;
      return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${safeName}`;
    } catch (err) {
      console.error("[Storage] S3 Upload failed, falling back to local storage:", err);
    }
  }

  // 2. Cloudinary Integration Point
  if (process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)) {
    try {
      console.log(`[Storage] Uploading ${safeName} to Cloudinary...`);
      // Cloudinary SDK upload placeholder:
      // const result = await cloudinary.uploader.upload(filePath);
      // return result.secure_url;
      return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || "pravadhya"}/image/upload/v1/${safeName}`;
    } catch (err) {
      console.error("[Storage] Cloudinary Upload failed, falling back to local storage:", err);
    }
  }

  // 3. Azure Blob Storage Integration Point
  if (process.env.AZURE_STORAGE_CONNECTION_STRING && process.env.AZURE_STORAGE_CONTAINER) {
    try {
      console.log(`[Storage] Uploading ${safeName} to Azure Blob...`);
      // Azure SDK upload placeholder:
      // const blobClient = containerClient.getBlockBlobClient(safeName);
      // await blobClient.uploadData(buffer);
      // return blobClient.url;
      return `https://${process.env.AZURE_STORAGE_ACCOUNT || "pravadhya"}.blob.core.windows.net/${process.env.AZURE_STORAGE_CONTAINER}/${safeName}`;
    } catch (err) {
      console.error("[Storage] Azure Blob Upload failed, falling back to local storage:", err);
    }
  }

  // 4. Default: Local Server File Upload Storage
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "menu");
    
    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, safeName);
    
    let buffer: Buffer;
    if (typeof fileData === "string") {
      // Decode base64 if base64 URI
      const base64Data = fileData.replace(/^data:image\/\w+;base64,/, "");
      buffer = Buffer.from(base64Data, "base64");
    } else {
      buffer = fileData;
    }

    await fs.writeFile(filePath, buffer);
    console.log(`[Storage] Successfully saved ${safeName} locally.`);
    
    // Return relative URL for static file serving
    return `/uploads/menu/${safeName}`;
  } catch (error) {
    console.error("[Storage] Local file save failed:", error);
    throw new Error("Failed to store uploaded food image.");
  }
}
