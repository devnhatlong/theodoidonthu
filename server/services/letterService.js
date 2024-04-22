const Letter = require("../models/letterModel");
const File = require('../models/fileModel'); // Import mô hình tập tin

const createLetter = async (letterData, fileDataList) => {
    try {
        // Tạo một đối tượng Letter mới từ các trường không phải là tập tin
        const newLetter = await Letter.create(letterData);

        // Lặp qua mảng fileDataList và lưu mỗi tệp vào cơ sở dữ liệu
        for (const fileData of fileDataList) {
            console.log("fileData: ", fileData)
            // Tạo đối tượng FileSchema mới từ dữ liệu tệp
            const newFile = new File({
                name: fileData.filename,
                size: fileData.size,
                type: fileData.mimetype,
                path: fileData.path
            });
            // Lưu đối tượng FileSchema vào cơ sở dữ liệu
            await newFile.save();
            // Thêm ID của tệp vào mảng files của đơn thư
            newLetter.files.push(newFile);
        }

        // Lưu đối tượng đơn thư đã cập nhật với các tệp đã được thêm vào mảng files
        await newLetter.save();

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

const getAllLetter = async (currentPage, pageSize, searchConditions) => {
    try {
        let totalRecords = 0;
        let letters;
        // Đếm tổng số lượng bản ghi phù hợp với điều kiện tìm kiếm
        if (searchConditions) {
            totalRecords = await Letter.countDocuments(searchConditions);
            // Tìm kiếm các bản ghi phù hợp với điều kiện tìm kiếm và áp dụng skip và limit
            letters = await Letter.find(searchConditions)
            .skip((currentPage - 1) * pageSize)
            .limit(pageSize)
            .exec();
        }
        else {
            totalRecords = await Letter.countDocuments();
            // Tìm kiếm các bản ghi phù hợp với điều kiện tìm kiếm và áp dụng skip và limit
            letters = await Letter.find()
            .skip((currentPage - 1) * pageSize)
            .limit(pageSize)
            .exec();
        }
        
        return { letters, totalRecords };
    } catch (error) {
        console.error("Lỗi khi tìm kiếm đơn thư:", error);
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


const deleteMultipleLetters = async (ids) => {
    try {
        const deletedLetter = await Letter.deleteMany({ _id: { $in: ids } });
        return deletedLetter;
    } catch (error) {
        console.error("Lỗi khi xóa đơn thư:", error);
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
    deleteMultipleLetters
};