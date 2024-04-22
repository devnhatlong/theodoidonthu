const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Thư mục lưu trữ tập tin tải lên
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Đặt tên cho tệp tải lên
    }
});
const upload = multer({ storage: storage });

// Middleware để ghi log thông tin về tệp đã được tải lên
const logUploadedFiles = (req, res, next) => {
    console.log("Uploaded files req:", req);
    console.log("Uploaded files:", req.body.uploadedFiles);
    next();
};

module.exports = { upload, logUploadedFiles };
