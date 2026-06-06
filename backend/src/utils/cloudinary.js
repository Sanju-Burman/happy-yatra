const cloudinary = require('cloudinary').v2;

const CLOUDINARY_URL = process.env.CLOUDINARY_URL;
if (CLOUDINARY_URL) {
    cloudinary.config({ url: CLOUDINARY_URL });
} else {
    throw new Error('CLOUDINARY_URL environment variable is not set');
}

const uploadBuffer = async (buffer, folder = 'users') => {
    const dataUri = `data:image/webp;base64,${buffer.toString('base64')}`;
    const opts = { folder, resource_type: 'image' };
    const res = await cloudinary.uploader.upload(dataUri, opts);
    return { url: res.secure_url, public_id: res.public_id, raw: res };
};

const destroy = async (public_id) => {
    if (!public_id) return null;
    return cloudinary.uploader.destroy(public_id, { resource_type: 'image' });
};

module.exports = { uploadBuffer, destroy };
