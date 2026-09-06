const cloudinary = require('cloudinary').v2;

let isConfigured = false;

const configureCloudinary = () => {
    if (isConfigured) return true;
    const CLOUDINARY_URL = process.env.CLOUDINARY_URL;
    const { CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

    if (CLOUDINARY_URL) {
        cloudinary.config({ url: CLOUDINARY_URL });
        isConfigured = true;
    } else if (CLOUDINARY_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
        cloudinary.config({
            cloud_name: CLOUDINARY_NAME,
            api_key: CLOUDINARY_API_KEY,
            api_secret: CLOUDINARY_API_SECRET
        });
        isConfigured = true;
    }
    return isConfigured;
};

// Initial config check without throwing at load time
configureCloudinary();

const uploadBuffer = async (buffer, folder = 'users') => {
    if (!configureCloudinary()) {
        throw new Error('Cloudinary is not configured. Please provide CLOUDINARY_URL or CLOUDINARY_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables.');
    }
    const dataUri = `data:image/webp;base64,${buffer.toString('base64')}`;
    const opts = { folder, resource_type: 'image' };
    const res = await cloudinary.uploader.upload(dataUri, opts);
    return { url: res.secure_url, public_id: res.public_id, raw: res };
};

const destroy = async (public_id) => {
    if (!public_id) return null;
    if (!configureCloudinary()) {
        return null;
    }
    return cloudinary.uploader.destroy(public_id, { resource_type: 'image' });
};

module.exports = { uploadBuffer, destroy };
