const Letter = require("../models/letterModel");
const File = require('../models/fileModel'); // Import mô hình tập tin
const fs = require('fs');
const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const createLetter = async (letterData, fileDataList, userId) => {
    try {
        const existingLetter = await Letter.findOne({ soDen: letterData.soDen, userId: userId });

        if (existingLetter) {
            throw new Error('Số đến đã tồn tại cho người dùng này.');
        }

        await client.connect();

        const db = client.db('theodoidonthu');
        const bucket = new GridFSBucket(db, { bucketName: 'files' });

        const savedFiles = [];

        for (const fileData of fileDataList) {
            const writeStream = bucket.openUploadStream(fileData.filename);
            const readStream = fs.createReadStream(fileData.path);

            await new Promise((resolve, reject) => {
                readStream.pipe(writeStream)
                    .on('error', reject)
                    .on('finish', async () => {
                        const fileDoc = new File({
                            _id: new ObjectId(),
                            userId: userId,
                            soDen: letterData.soDen,
                            name: fileData.filename,
                            size: fileData.size,
                            type: fileData.mimetype,
                            path: `fs/${fileData.filename}`
                        });
                        await fileDoc.save();

                        savedFiles.push({
                            _id: fileDoc._id,
                            name: fileDoc.name,
                            size: fileDoc.size,
                            type: fileDoc.type,
                            path: fileDoc.path
                        });
                        fs.unlinkSync(fileData.path);
                        resolve();
                    });
            });
        }

        const newLetter = new Letter({
            ...letterData,
            userId: userId,
            files: savedFiles
        });

        await newLetter.save();

        return { success: true, data: newLetter };
    } catch (error) {
        console.error("Lỗi khi tạo đơn thư:", error);
        return { success: false, message: "Đã xảy ra lỗi trong quá trình tạo đơn thư" };
    } finally {
        await client.close();
    }
};

const getFile = async (id) => {
    try {
        const file = await File.findById(id);
        return file;
    } catch (error) {
        console.error("Error retrieving file:", error);
        return null;
    }
};

const getLetter = async (id, userId) => {
    try {
        await client.connect();

        const db = client.db('theodoidonthu');
        const bucket = new GridFSBucket(db, { bucketName: 'files' });

        // Fetch the letter with basic information
        const letter = await Letter.findOne({ _id: id, userId: userId }).lean();

        if (!letter) {
            throw new Error('Letter not found');
        }

        // Fetch the file contents
        const filesWithContent = await Promise.all(letter.files.map(async file => {
            const downloadStream = bucket.openDownloadStreamByName(file.name);
            const chunks = [];

            return new Promise((resolve, reject) => {
                downloadStream.on('data', chunk => {
                    chunks.push(chunk);
                });

                downloadStream.on('error', err => {
                    reject(err);
                });

                downloadStream.on('end', () => {
                    const content = Buffer.concat(chunks);
                    resolve({
                        ...file,
                        content: content.toString('base64') // Encode the content to base64 if you need to send it in a response
                    });
                });
            });
        }));

        letter.files = filesWithContent;
        await client.close();
        return letter;
    } catch (error) {
        await client.close();
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

const updateLetter = async (id, updateData, userId) => {
    try {
        const updatedLetter = await Letter.findByIdAndUpdate(
            id, 
            { ...updateData, userId: userId }, 
            { new: true }
        );

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
    getFile,
    getLetter,
    getAllLetter,
    updateLetter,
    deleteLetter,
    deleteMultipleLetters
};