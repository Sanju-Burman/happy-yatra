const multer = require('multer');
const sharp = require('sharp');
const ErrorResponse = require('../utils/ErrorResponse');
const { uploadBuffer } = require('../utils/cloudinary');

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error('Invalid file type'));
        }
        cb(null, true);
    }
});

const fields = upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
]);

const uploadImagesMiddleware = async (req, res, next) => {
    fields(req, res, async (err) => {

        if (err) return next(new ErrorResponse(err.message || 'File upload error', 400));

        try {
            const userId = req.user && req.user.id ? String(req.user.id) : 'anonymous';
            const uploadedImages = {};

            const processFile = async (file) => {
                // Convert to webp and compress
                const buffer = await sharp(file.buffer)
                    .resize({ width: 1600 })
                    .webp({ quality: 80 })
                    .toBuffer();

                const res = await uploadBuffer(buffer, `users/${userId}`);
                return res;
            };

            if (req.files && req.files.profilePicture && req.files.profilePicture[0]) {
                const res = await processFile(req.files.profilePicture[0]);
                uploadedImages.profilePicture = res;
            }

            if (req.files && req.files.coverImage && req.files.coverImage[0]) {
                const res = await processFile(req.files.coverImage[0]);
                uploadedImages.coverImage = res;
            }

            req.uploadedImages = uploadedImages;
            next();
        } catch (error) {
            next(new ErrorResponse(error.message || 'Image processing failed', 500));
        }
    });
};

module.exports = { uploadImagesMiddleware };
