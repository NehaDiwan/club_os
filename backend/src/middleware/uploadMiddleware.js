const multer = require('multer');
const path = require('path');
const { storage } = require('../config/cloudinary');

const allowedMimeTypes = new Set([
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/webp',
	'image/avif',
	'image/heic',
	'image/heif',
	'image/jfif',
	'application/pdf',
	'application/octet-stream',
]);

const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.heic', '.heif', '.jfif', '.pdf']);

const upload = multer({
	storage,
	fileFilter: (req, file, cb) => {
		if (!file) {
			cb(null, true);
			return;
		}

		const ext = path.extname(file.originalname || '').toLowerCase();
		const isAllowedMime = allowedMimeTypes.has(file.mimetype);
		const isAllowedExt = allowedExtensions.has(ext);

		if (isAllowedMime || isAllowedExt) {
			cb(null, true);
			return;
		}

		cb(new Error('Please upload a valid file: jpg, jpeg, png, webp, avif, heic, heif, jfif, or pdf'));
	},
	limits: {
		fileSize: 10 * 1024 * 1024,
	},
});

const uploadBillImage = (req, res, next) => {
	upload.single('billImage')(req, res, (err) => {
		if (!err) {
			return next();
		}

		// Normalize upload errors so clients get actionable messages.
		const message =
			err.message ||
			err.error?.message ||
			err.http_code?.toString() ||
			err.cause?.message ||
			'Bill upload failed. Please use jpg, jpeg, png, webp, avif, heic, heif, jfif, or pdf.';

		const status = err.name === 'MulterError' || message.toLowerCase().includes('please upload') ? 400 : 500;
		res.status(status);

		if (!err.message) {
			err.message = message;
		}

		return next(err);
	});
};

module.exports = { upload, uploadBillImage };
