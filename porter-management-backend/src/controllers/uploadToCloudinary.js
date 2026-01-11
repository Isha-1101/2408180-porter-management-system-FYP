import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: "porter-details",
        resource_type: "auto", // image, pdf, doc
        access_mode: "authenticated", // private by default
      },
      (error, result) => {
        if (error) return reject(error);

        resolve({
          id: result.public_id,
          url: result.secure_url,
          format: result.format,
          bytes: result.bytes,
        });
      }
    ).end(file.buffer);
  });
};
