const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    // filename: function (req, file, cb) {
    //     const fileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    //     cb(null, fileName);
    // }
    filename: function (req, file, cb) {
        if (!req.fileTimestamps) {
            req.fileTimestamps = {};
        }
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const timestamp = Date.now(); // Generate timestamp
        req.fileTimestamps[file.originalname] = timestamp; // Store timestamp in the request object

        const fileExtension = path.extname(originalName); // Lấy phần mở rộng của file
        const baseName = path.basename(originalName, fileExtension); // Lấy phần tên của file mà không có phần mở rộng

        const newFileName = `${baseName}-${timestamp}${fileExtension}`; // Tạo tên file mới với thời gian thêm vào
        cb(null, newFileName);
    }
});
const upload = multer({ storage: storage });

module.exports = { upload };
