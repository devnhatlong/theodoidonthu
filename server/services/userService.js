const User = require("../models/userModel");
const { generateAccessToken, generateRefreshToken } = require("../middlewares/jwt");

const register = async (userData) => {
    const { userName } = userData;

    // Kiểm tra xem người dùng đã tồn tại hay chưa
    const existingUser = await User.findOne({ userName });
    if (existingUser) {
        throw new Error("User already exists!");
    }

    // Tạo người dùng mới
    const newUser = await User.create(userData);
    return newUser;
};

const login = async (user) => {
    const { userName, password } = user;
    // plain object thuần
    // response là một instance object
    const response = await User.findOne({userName});

    if (response && await response.isCorrectPassword(password)) {
        const { password, role, refreshToken, ...userData } = response.toObject(); // phải convert instance object sang object thuần
        
        const accessToken = generateAccessToken(response._id, role);
        const newRefreshToken = generateRefreshToken(response._id);

        // save refreshtoken into db
        await User.findByIdAndUpdate(response._id, { refreshToken: newRefreshToken }, { new: true });

        return { userData,  accessToken, newRefreshToken };
    }
    else {
        throw new Error("Invalid credentials!");
    }
};

const getUser = async (userId) => {
    const user = await User.findById(userId).select("-password -refreshToken -role");
    return user;
};

const deleteUser = async (userId) => {
    const user = await User.findByIdAndDelete(userId);
    return user;
};

const updateUser = async (userId, dataUpdate) => {
    const user = await User.findByIdAndUpdate(userId, dataUpdate, { new: true }).select("-password -refreshToken -role");
    return user;
};

const updateUserByAdmin = async (userId, dataUpdate) => {
    const user = await User.findByIdAndUpdate(userId, dataUpdate, { new: true }).select("-password -refreshToken -role");
    return user;
};

module.exports = {
    register,
    login,
    getUser,
    deleteUser,
    updateUser,
    updateUserByAdmin
};