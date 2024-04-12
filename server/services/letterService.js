const Letter = require("../models/letterModel");

const createLetter = async (letterData) => {
    try {
        const newLetter = await Letter.create(letterData);

        return { success: true, data: newLetter };
    } catch (error) {
        console.error("Lỗi khi tạo đơn thư:", error);
        return { success: false, message: "Đã xảy ra lỗi trong quá trình tạo đơn thư" };
    }
};

const getLetter = async (id) => {
    try {
        const letter = await Letter.findById(id);
        return letter;
    } catch (error) {
        console.error("Lỗi khi lấy đơn thư:", error);
        return null;
    }
};

const getAllLetter = async (currentPage, pageSize) => {
    try {
        const letters = await Letter.find()
            .skip((currentPage - 1) * pageSize)
            .limit(parseInt(pageSize));
        return letters;
    } catch (error) {
        console.error("Lỗi khi lấy tất cả đơn thư:", error);
        return null;
    }
};

const getTotalCount = async () => {
    try {
        const totalCount = await Letter.countDocuments();
        return totalCount;
    } catch (error) {
        console.error("Lỗi khi lấy tổng số đơn thư:", error);
        return 0;
    }
};

const updateLetter = async (id, updateData) => {
    try {
        const updatedLetter = await Letter.findByIdAndUpdate(id, updateData, { new: true });
        return updatedLetter;
    } catch (error) {
        console.error("Lỗi khi cập nhật đơn thư:", error);
        return null;
    }
};

const deleteLetter = async (id) => {
    try {
        const deletedLetter = await Letter.findByIdAndDelete(id);
        return deletedLetter;
    } catch (error) {
        console.error("Lỗi khi xóa đơn thư:", error);
        return null;
    }
};

const searchLetters = async (searchConditions, currentPage, pageSize) => {
    try {
        // Đếm tổng số lượng bản ghi phù hợp với điều kiện tìm kiếm
        const totalRecords = await Letter.countDocuments(searchConditions);

        // Tìm kiếm các bản ghi phù hợp với điều kiện tìm kiếm và áp dụng skip và limit
        const letters = await Letter.find(searchConditions)
            .skip((currentPage - 1) * pageSize)
            .limit(pageSize)
            .exec();
        
        return { letters, totalRecords };
    } catch (error) {
        console.error("Lỗi khi tìm kiếm đơn thư:", error);
        return null;
    }
};

module.exports = {
    createLetter,
    getLetter,
    getAllLetter,
    getTotalCount,
    updateLetter,
    deleteLetter,
    searchLetters
};