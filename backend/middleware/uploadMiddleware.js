const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'));
};

const uploadImages = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter
});

const uploadSingleImage = uploadImages.single('image');
const uploadMultipleImages = uploadImages.array('images', 5);

/**
 * Uploads a single buffer to Cloudinary.
 * Returns the secure_url string, or null if Cloudinary is not configured.
 */
const uploadToCloudinary = async (buffer, folder = 'kaamsetu') => {
  const hasCloudinary =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (!hasCloudinary) {
    console.warn(
      '[uploadMiddleware] Cloudinary not configured — skipping upload. Set CLOUDINARY_* env vars.'
    );
    return null;
  }

  const cloudinary = require('../config/cloudinary');

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    const { Readable } = require('stream');
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};

/**
 * Uploads multiple buffers to Cloudinary.
 * Returns array of secure_urls (nulls filtered out).
 */
const uploadManyToCloudinary = async (files = [], folder = 'kaamsetu') => {
  const results = await Promise.all(
    files.map((f) => uploadToCloudinary(f.buffer, folder))
  );
  return results.filter(Boolean);
};

module.exports = {
  uploadImages,
  uploadSingleImage,
  uploadMultipleImages,
  uploadToCloudinary,
  uploadManyToCloudinary
};