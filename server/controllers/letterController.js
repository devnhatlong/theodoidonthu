const asyncHandler = require("express-async-handler");
const LetterService = require("../services/letterService");
const moment = require('moment');
require('moment-timezone');

const createLetter = asyncHandler(async (req, res) => {
    const { soDen, ngayDen, ngayDon, nguoiGui, diaChi, lanhDao } = req.body;

    if (!soDen || !ngayDen || !ngayDon || !nguoiGui || !diaChi || !lanhDao) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng cung cấp đầy đủ thông tin"
        });
    }

    const response = await LetterService.createLetter(req.body, req.files);
    return res.status(200).json({
        success: response.success,
        message: response.success ? "Tạo đơn thư thành công" : "Số đến đã tồn tại"
    });
});

const getLetter = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await LetterService.getLetter(id);
    return res.status(200).json({
        success: response ? true : false,
        letter: response ? response : "Không tìm thấy đơn thư"
    });
});

const getAllLetter = asyncHandler(async (req, res) => {
    let { soDen, ngayDen, soVanBan, ngayDon, nguoiGui, diaChi, lanhDao, chuyen1, chuyen2, ghiChu, trichYeu, tuNgay, denNgay } = req.query.filters || {};
    const { currentPage, pageSize } = req.query;

    // Xây dựng các điều kiện tìm kiếm dựa trên các tham số được cung cấp
    const searchConditions = {};
    if (soDen) searchConditions.soDen = soDen;
    if (ngayDen) searchConditions.ngayDen = moment.utc(ngayDen, 'DD/MM/YYYY').subtract(1, 'days').startOf('day').add(17, 'hours').toDate();
    if (soVanBan) searchConditions.soVanBan = soVanBan;
    if (ngayDon) searchConditions.ngayDon = moment.utc(ngayDon, 'DD/MM/YYYY').subtract(1, 'days').startOf('day').add(17, 'hours').toDate();
    if (nguoiGui) searchConditions.nguoiGui = nguoiGui;
    if (diaChi) searchConditions.diaChi = diaChi;
    if (lanhDao) searchConditions.lanhDao = lanhDao;
    if (chuyen1) searchConditions.chuyen1 = chuyen1;
    if (chuyen2) searchConditions.chuyen2 = chuyen2;
    if (ghiChu) searchConditions.ghiChu = ghiChu;
    if (trichYeu) searchConditions.trichYeu = trichYeu;

    // Thêm điều kiện lọc trong khoảng ngày nếu có tuNgay và denNgay
    if (tuNgay && denNgay) {
        searchConditions.ngayDen = {
            $gte: moment.utc(tuNgay, 'DD/MM/YYYY').subtract(1, 'days').startOf('day').add(17, 'hours').toDate(),
            $lte: moment.utc(denNgay, 'DD/MM/YYYY').subtract(1, 'days').startOf('day').add(17, 'hours').toDate()
        };
    }

    const response = await LetterService.getAllLetter(currentPage, pageSize, searchConditions);

    // Trả về danh sách các đơn thư phù hợp với yêu cầu tìm kiếm
    return res.status(200).json({
        success: response ? true : false,
        letters: response ? response.letters : "Không có đơn thư nào được tìm thấy",
        totalRecord: response ? response.totalRecords : 0
    });
});

const updateLetter = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) throw new Error("Thiếu id");

    const response = await LetterService.updateLetter(id, req.body);

    return res.status(200).json({
        success: response ? true : false,
        updatedLetter: response ? response : "Đã xảy ra lỗi"
    });
});

const deleteLetter = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) throw new Error("Thiếu id");

    const response = await LetterService.deleteLetter(id);

    return res.status(200).json({
        success: response ? true : false,
        deletedLetter: response ? response : "Không có đơn thư nào được xóa"
    });
});

const deleteMultipleLetters = asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (!ids) throw new Error("Thiếu id");

    const response = await LetterService.deleteMultipleLetters(ids);

    return res.status(200).json({
        success: response ? true : false,
        deletedLetter: response ? response : "Không có đơn thư nào được xóa"
    });
});

module.exports = {
    createLetter,
    getLetter,
    getAllLetter,
    updateLetter,
    deleteLetter,
    deleteMultipleLetters
}