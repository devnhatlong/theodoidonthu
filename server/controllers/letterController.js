const asyncHandler = require("express-async-handler");
const LetterService = require("../services/letterService");
const moment = require('moment');
require('moment-timezone');

const { MongoClient, GridFSBucket } = require('mongodb');

const uri = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@localhost:27017/theodoidonthu?authSource=admin`
const client = new MongoClient(uri);

const createLetter = asyncHandler(async (req, res) => {
    const { soDen, ngayDen, ngayDon, nguoiGui, diaChi, lanhDao } = req.body;
    const { _id } = req.user;

    if (!soDen || !ngayDen || !ngayDon || !nguoiGui || !diaChi || !lanhDao) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng cung cấp đầy đủ thông tin"
        });
    }

    const response = await LetterService.createLetter(req.body, req.files, _id);
    return res.status(200).json({
        success: response.success,
        message: response.success ? "Tạo đơn thư thành công" : "Số đến đã tồn tại"
    });
});

const getFile = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const file = await LetterService.getFile(id);
    if (!file) {
        return res.status(404).json({ success: false, message: "File not found" });
    }
    
    const db = client.db('theodoidonthu');
    const bucket = new GridFSBucket(db, { bucketName: 'files' });

    const downloadStream = bucket.openDownloadStreamByName(file.name);

    // Set headers
    res.set('Content-Type', file.type);
    res.set('Content-Disposition', `inline; filename="${file.name}"`);

    // Pipe the download stream to response
    downloadStream.pipe(res);
});

const getLetter = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { _id } = req.user;

    const response = await LetterService.getLetter(id, _id);
    return res.status(200).json({
        success: response ? true : false,
        letter: response ? response : "Không tìm thấy đơn thư"
    });
});

const getAllLetter = asyncHandler(async (req, res) => {
    let { soDen, ngayDen, soVanBan, ngayDon, nguoiGui, diaChi, lanhDao, chuyen1, chuyen2, ghiChu, trichYeu, tuNgay, denNgay } = req.query.filters || {};
    const { currentPage, pageSize } = req.query;
    const { _id } = req.user;

    // Xây dựng các điều kiện tìm kiếm dựa trên các tham số được cung cấp
    const searchConditions = {};
    if (soDen) searchConditions.soDen = soDen.trim();
    if (ngayDen) searchConditions.ngayDen = moment.utc(ngayDen, 'DD/MM/YYYY').subtract(1, 'days').startOf('day').add(17, 'hours').toDate();
    if (soVanBan) searchConditions.soVanBan = soVanBan.trim();
    if (ngayDon) searchConditions.ngayDon = moment.utc(ngayDon, 'DD/MM/YYYY').subtract(1, 'days').startOf('day').add(17, 'hours').toDate();
    if (nguoiGui) searchConditions.nguoiGui = { $regex: nguoiGui.trim(), $options: 'i' }; // 'i' để không phân biệt chữ hoa chữ thường
    if (diaChi) searchConditions.diaChi = { $regex: diaChi.trim(), $options: 'i' };
    if (lanhDao) searchConditions.lanhDao = { $regex: lanhDao.trim(), $options: 'i' };
    if (chuyen1) searchConditions.chuyen1 = { $regex: chuyen1.trim(), $options: 'i' };
    if (chuyen2) searchConditions.chuyen2 = { $regex: chuyen2.trim(), $options: 'i' };
    if (ghiChu) searchConditions.ghiChu = { $regex: ghiChu.trim(), $options: 'i' };
    if (trichYeu) searchConditions.trichYeu = { $regex: trichYeu.trim(), $options: 'i' };

    // Thêm điều kiện lọc trong khoảng ngày nếu có tuNgay và denNgay
    if (tuNgay && denNgay) {
        searchConditions.ngayDen = {
            $gte: moment.utc(tuNgay, 'DD/MM/YYYY').subtract(1, 'days').startOf('day').add(17, 'hours').toDate(),
            $lte: moment.utc(denNgay, 'DD/MM/YYYY').subtract(1, 'days').startOf('day').add(17, 'hours').toDate()
        };
    }

    const response = await LetterService.getAllLetter(currentPage, pageSize, searchConditions, _id);

    // Trả về danh sách các đơn thư phù hợp với yêu cầu tìm kiếm
    return res.status(200).json({
        success: response ? true : false,
        letters: response ? response.letters : "Không có đơn thư nào được tìm thấy",
        totalRecord: response ? response.totalRecords : 0
    });
});

const updateLetter = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { _id } = req.user;

    if (!id) throw new Error("Thiếu id");

    const response = await LetterService.updateLetter(id, req.body, _id);

    return res.status(200).json({
        success: response ? true : false,
        updatedLetter: response ? response : "Đã xảy ra lỗi"
    });
});

const deleteLetter = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { _id } = req.user;

    if (!id) throw new Error("Thiếu id");

    const response = await LetterService.deleteLetter(id, _id);

    return res.status(200).json({
        success: response ? true : false,
        deletedLetter: response ? response : "Không có đơn thư nào được xóa"
    });
});

const deleteMultipleLetters = asyncHandler(async (req, res) => {
    const { ids } = req.body;
    const { _id } = req.user;

    if (!ids) throw new Error("Thiếu id");

    const response = await LetterService.deleteMultipleLetters(ids, _id);

    return res.status(200).json({
        success: response ? true : false,
        deletedLetter: response ? response : "Không có đơn thư nào được xóa"
    });
});

module.exports = {
    createLetter,
    getFile,
    getLetter,
    getAllLetter,
    updateLetter,
    deleteLetter,
    deleteMultipleLetters
}