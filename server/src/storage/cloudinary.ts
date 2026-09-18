import { v2 as cloudinary } from "cloudinary";

export function cloudinaryEnabled() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export function initCloudinary() {
  if (!cloudinaryEnabled()) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function uploadToCloudinary(buffer: Buffer, filename?: string): Promise<string> {
  initCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER || "perfumeria",
        resource_type: "image",
        filename_override: filename,
        unique_filename: true,
        use_filename: Boolean(filename),
      },
      (err, result) => {
        if (err || !result?.secure_url) return reject(err || new Error("Cloudinary no devolvió URL."));
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

export async function uploadFileToCloudinary(filepath: string): Promise<string> {
  initCloudinary();
  const result = await cloudinary.uploader.upload(filepath, {
    folder: process.env.CLOUDINARY_FOLDER || "perfumeria",
    resource_type: "image",
  });
  return result.secure_url;
}
