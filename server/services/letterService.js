const Letter = require("../models/letterModel");
const File = require('../models/fileModel'); // Import mô hình tập tin
const fs = require('fs');

const createLetter = async (letterData, fileDataList, userId) => {
    try {
        const existingLetter = await Letter.findOne({ soDen: letterData.soDen, userId: userId });

        if (existingLetter) {
            throw new Error('Số đến đã tồn tại cho người dùng này.');
        }

        // Tạo một đối tượng Letter mới từ các trường không phải là tập tin
        const newLetter = await Letter.create({ ...letterData, userId: userId});

        // Lặp qua mảng fileDataList và thêm thông tin của mỗi tệp vào mảng files của đơn thư
        const files = fileDataList.map(fileData => ({
            name: fileData.filename,
            size: fileData.size,
            type: fileData.mimetype,
            path: fileData.path
        }));

        // Thêm mảng files vào đơn thư
        newLetter.files = files;

        // Lưu đối tượng đơn thư đã cập nhật với các thông tin tệp đã được thêm vào mảng files
        await newLetter.save();

        return { success: true, data: newLetter };
    } catch (error) {
        console.error("Lỗi khi tạo đơn thư:", error);
        return { success: false, message: "Đã xảy ra lỗi trong quá trình tạo đơn thư" };
    }
};

// const createLetter = async (letterData, fileDataList) => {
//     try {
//         // Tạo một đối tượng Letter mới từ các trường không phải là tập tin
//         const newLetter = await Letter.create(letterData);

//         // Lặp qua mảng fileDataList và lưu mỗi tệp vào cơ sở dữ liệu
//         for (const fileData of fileDataList) {
//             // Đọc dữ liệu từ tệp
//             const fileBuffer = fs.readFileSync(fileData.path);
//             // Tạo đối tượng FileSchema mới từ dữ liệu tệp
//             const newFile = new File({
//                 name: fileData.filename,
//                 size: fileData.size,
//                 type: fileData.mimetype,
//                 path: fileData.path,
//                 data: fileBuffer
//             });
//             // Lưu đối tượng FileSchema vào cơ sở dữ liệu
//             const savedFile = await newFile.save();
//             // Thêm ID và đường dẫn của tệp vào mảng files của đơn thư
//             newLetter.files.push({ _id: savedFile._id, name: savedFile.name, path: savedFile.path });
//         }

//         // Lưu đối tượng đơn thư đã cập nhật với các tệp đã được thêm vào mảng files
//         await newLetter.save();

//         return { success: true, data: newLetter };
//     } catch (error) {
//         console.error("Lỗi khi tạo đơn thư:", error);
//         return { success: false, message: "Đã xảy ra lỗi trong quá trình tạo đơn thư" };
//     }
// };

//handle when file big
// const stream = require('stream');

// const createLetter = async (letterData, fileDataList) => {
//     try {
//         // Tạo một đối tượng Letter mới từ các trường không phải là tập tin
//         const newLetter = await Letter.create(letterData);

//         // Lặp qua mảng fileDataList và lưu mỗi tệp vào cơ sở dữ liệu
//         for (const fileData of fileDataList) {
//             // Tạo một Readable stream từ tệp
//             const readStream = fs.createReadStream(fileData.path);

//             // Tạo một Writeable stream để lưu dữ liệu vào cơ sở dữ liệu
//             const writeStream = new stream.Writable({
//                 write(chunk, encoding, callback) {
//                     // Tạo một đối tượng FileSchema mới từ dữ liệu tệp
//                     const newFile = new File({
//                         name: fileData.filename,
//                         size: fileData.size,
//                         type: fileData.mimetype,
//                         path: fileData.path
//                     });

//                     // Ghi dữ liệu từ chunk vào đối tượng FileSchema
//                     newFile.data = Buffer.from(chunk);

//                     // Lưu đối tượng FileSchema vào cơ sở dữ liệu
//                     newFile.save()
//                         .then(() => {
//                             // Thêm ID của tệp vào mảng files của đơn thư
//                             newLetter.files.push(newFile._id);
//                             callback();
//                         })
//                         .catch((error) => {
//                             console.error("Lỗi khi lưu tệp:", error);
//                             callback(error);
//                         });
//                 }
//             });

//             // Xử lý sự kiện khi kết thúc đọc tệp
//             readStream.on('end', () => {
//                 // Khi kết thúc đọc tệp, kết thúc việc ghi dữ liệu vào cơ sở dữ liệu
//                 writeStream.end();
//             });

//             // Xử lý sự kiện lỗi khi đọc tệp
//             readStream.on('error', (error) => {
//                 console.error("Lỗi khi đọc tệp:", error);
//                 writeStream.end();
//             });

//             // Pipe dữ liệu từ readStream vào writeStream
//             readStream.pipe(writeStream);
//         }

//         // Lưu đối tượng đơn thư đã cập nhật với các tệp đã được thêm vào mảng files
//         await newLetter.save();

//         return { success: true, data: newLetter };
//     } catch (error) {
//         console.error("Lỗi khi tạo đơn thư:", error);
//         return { success: false, message: "Đã xảy ra lỗi trong quá trình tạo đơn thư" };
//     }
// };

const getLetter = async (id, userId) => {
    try {
        const letter = await Letter.findById({ _id: id, userId: userId });
        return letter;
    } catch (error) {
        console.error("Lỗi khi lấy đơn thư:", error);
        return null;
    }
};

const getAllLetter = async (currentPage, pageSize, searchConditions, userId) => {
    try {
        let totalRecords = 0;
        let letters;
        
        if (currentPage === 0 && pageSize === 0) {
            // Trường hợp lấy tất cả dữ liệu
            if (searchConditions) {
                totalRecords = await Letter.countDocuments({ ...searchConditions, userId: userId });
                letters = await Letter.find({ ...searchConditions, userId: userId }).exec();
            } else {
                totalRecords = await Letter.countDocuments({ userId: userId });
                letters = await Letter.find({ userId: userId }).exec();
            }
        } else {
            // Trường hợp áp dụng phân trang
            if (searchConditions) {
                totalRecords = await Letter.countDocuments({ ...searchConditions, userId: userId });
                letters = await Letter.find({ ...searchConditions, userId: userId })
                    .skip((currentPage - 1) * pageSize)
                    .limit(pageSize)
                    .exec();
            } else {
                totalRecords = await Letter.countDocuments({ userId: userId });
                letters = await Letter.find({ userId: userId })
                    .skip((currentPage - 1) * pageSize)
                    .limit(pageSize)
                    .exec();
            }
        }
        
        return { letters, totalRecords };
    } catch (error) {
        console.error("Lỗi khi tìm kiếm đơn thư:", error);
        return null;
    }
};

const updateLetter = async (id, updateData, fileDataList, userId) => {
    try {
        // Chuyển đổi dữ liệu tệp từ fileDataList
        const files = fileDataList.map(fileData => ({
            name: fileData.filename,
            size: fileData.size,
            type: fileData.mimetype,
            path: fileData.path
        }));
        
        // Cập nhật thông tin tệp vào dữ liệu cần cập nhật
        updateData.files = files;

        // Kiểm tra và cập nhật trường soVanBan
        if (updateData.soVanBan === 'null') {
            updateData.soVanBan = null;
        }

        // Thực hiện cập nhật đơn thư
        const updatedLetter = await Letter.findByIdAndUpdate(id, { ...updateData, userId: userId }, { new: true });
        return updatedLetter;
    } catch (error) {
        console.error("Lỗi khi cập nhật đơn thư:", error);
        return null;
    }
};

const deleteLetter = async (id, userId) => {
    try {
        const deletedLetter = await Letter.findByIdAndDelete({ _id: id, userId: userId });
        return deletedLetter;
    } catch (error) {
        console.error("Lỗi khi xóa đơn thư:", error);
        return null;
    }
};


const deleteMultipleLetters = async (ids, userId) => {
    try {
        const deletedLetter = await Letter.deleteMany({ _id: { $in: ids }, userId: userId });
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
    updateLetter,
    deleteLetter,
    deleteMultipleLetters
};