const asyncHandler = require("express-async-handler");
const LetterService = require("../services/letterService");

const createLetter = asyncHandler(async (req, res) => {
    const { soDen, ngayDen, ngayDon, nguoiGui, diaChi, lanhDao } = req.body;

    if (!soDen || !ngayDen || !ngayDon || !nguoiGui || !diaChi || !lanhDao) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng cung cấp đầy đủ thông tin"
        });
    }

    const response = await LetterService.createLetter(req.body);
    return res.status(200).json({
        success: response.success,
        message: response.success ? "Tạo đơn thư thành công" : "Số đến đã tồn tại"
    });
});

const getLetter = asyncHandler(async (req, res) => {
    const { id } = req.query;

    const response = await LetterService.getLetter(id);
    return res.status(200).json({
        success: response ? true : false,
        result: response ? response : "Không tìm thấy đơn thư"
    });
});

const getAllLetter = asyncHandler(async (req, res) => {
    const { currentPage, pageSize } = req.query;
    const totalCount = await LetterService.getTotalCount();
    const response = await LetterService.getAllLetter(currentPage, pageSize);

    return res.status(200).json({
        success: response ? true : false,
        letters: response,
        totalRecord: totalCount
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
        deletedLetter: response ? `Đã xóa đơn thư với số đến: ${response.soDen}` : "Không có đơn thư nào được xóa"
    });
});

const searchLetters = asyncHandler(async (req, res) => {
    // Lấy các tham số tìm kiếm từ query string
    const { soDen, ngayDen, soVanBan, ngayDon, nguoiGui, diaChi, lanhDao, chuyen1, chuyen2, ghiChu, trichYeu, currentPage, pageSize } = req.query.searchParams;

    // Xây dựng các điều kiện tìm kiếm dựa trên các tham số được cung cấp
    const searchConditions = {};
    if (soDen) searchConditions.soDen = soDen;
    if (ngayDen) searchConditions.ngayDen = ngayDen;
    if (soVanBan) searchConditions.soVanBan = soVanBan;
    if (ngayDon) searchConditions.ngayDon = ngayDon;
    if (nguoiGui) searchConditions.nguoiGui = nguoiGui;
    if (diaChi) searchConditions.diaChi = diaChi;
    if (lanhDao) searchConditions.lanhDao = lanhDao;
    if (chuyen1) searchConditions.chuyen1 = chuyen1;
    if (chuyen2) searchConditions.chuyen2 = chuyen2;
    if (ghiChu) searchConditions.ghiChu = ghiChu;
    if (trichYeu) searchConditions.trichYeu = trichYeu;

    // Thực hiện tìm kiếm sử dụng các điều kiện tìm kiếm đã xây dựng
    const response = await LetterService.searchLetters(searchConditions, currentPage, pageSize);

    // Trả về danh sách các đơn thư phù hợp với yêu cầu tìm kiếm
    return res.status(200).json({
        success: response ? true : false,
        letters: response ? response.letters : "Không có đơn thư nào được tìm thấy",
        totalRecord: response ? response.totalRecords : 0
    });
});

module.exports = {
    createLetter,
    getLetter,
    getAllLetter,
    updateLetter,
    deleteLetter,
    searchLetters
}