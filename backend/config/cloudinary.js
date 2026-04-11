const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const isConfigured = () =>
  !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

/**
 * Upload a file path or data URI to Cloudinary.
 * Returns { url, publicId } or throws.
 */
const uploadToCloudinary = async (file, folder = 'kaamsetu') => {
  if (!isConfigured()) {
    console.warn('[cloudinary] Not configured — skipping upload');
    return { url: '', publicId: '' };
  }
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'auto'
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    console.error('[cloudinary] Upload error:', error.message);
    throw new Error('Failed to upload file to Cloudinary');
  }
};

/**
 * Upload a multer memory buffer to Cloudinary via base64 data URI.
 */
const uploadBufferToCloudinary = async (
  buffer,
  mimetype,
  folder = 'kaamsetu'
) => {
  if (!buffer || !mimetype) throw new Error('buffer and mimetype are required');
  const dataUri = `data:${mimetype};base64,${buffer.toString('base64')}`;
  return uploadToCloudinary(dataUri, folder);
};

/**
 * Delete a resource from Cloudinary by publicId.
 */
const deleteFromCloudinary = async (publicId) => {
  if (!isConfigured() || !publicId) return false;
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('[cloudinary] Delete error:', error.message);
    return false;
  }
};

module.exports = cloudinary;
module.exports.uploadToCloudinary      = uploadToCloudinary;
module.exports.uploadBufferToCloudinary = uploadBufferToCloudinary;
module.exports.deleteFromCloudinary    = deleteFromCloudinary;
module.exports.isConfigured            = isConfigured;