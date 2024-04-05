const asyncHandler = require("express-async-handler");
const UserService = require("../services/userService");
const jwt = require("jsonwebtoken");
const { generateAccessToken } = require("../middlewares/jwt");
const User = require("../models/userModel");
const sendMail = require("../ultils/sendMail");
const crypto = require("crypto");

const register = asyncHandler(async(req, res) => { 
    const { userName, password } = req.body;
    
    if (!userName || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required information"
        });
    }

    const response = await UserService.register(req.body);
    return res.status(200).json({
        success: response ? true : false,
        message: response ? "Register is successfully" : "Something went wrong"
    });
});

const login = asyncHandler(async(req, res) => { 
    const { userName, password } = req.body;
    
    if (!userName || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required information"
        });
    }

    const response = await UserService.login(req.body);
    const { accessToken, newRefreshToken, ...userData} = response;

    // refreshToken => dùng để cấp mới accesstoken
    // accesstoken => dùng để xác thực người dùng, quyền người dùng, phân quyền người dùng
    // Save refreshToken into cookie
    res.cookie("refreshToken", newRefreshToken, { httpOnly: true, maxAge: 7*24*60*60*1000 });

    return res.status(200).json({
        success: response ? true : false,
        accessToken,
        message: userData
    });
});

const getUser = asyncHandler(async(req, res) => { 
    const { _id } = req.user;
    
    const response = await UserService.getUser(_id);
    return res.status(200).json({
        success: response ? true : false,
        result: response ? response : "User not found"
    });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    // get token from cookies
    const cookie = req.cookies;

    // check cookie exist
    if (!cookie && !cookie.refreshToken) {
        throw new Error("No refresh token in cookies");
    }

    // verify token
    const result = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET);

    const response = await User.findOne({ _id: result._id, refreshToken: cookie.refreshToken });
        
    return res.status(200).json({
        success: response ? true : false,
        newAccessToken: response ? generateAccessToken(response._id, response.role) : "Refresh token not matched"
    });
});

const logout = asyncHandler(async(req, res) => { 
    // get token from cookies
    const cookie = req.cookies;
    
    if (!cookie || !cookie.refreshToken) {
        throw new Error("No refresh token in cookies");
    }

    // Update refresh token in db
    await User.findOneAndUpdate({refreshToken: cookie.refreshToken}, {refreshToken: ""}, {new: true});

    // Delete refresh token ib cookie browser
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true
    });

    return res.status(200).json({
        success: true,
        message: "Logout is done"
    });
});

/**
 * Client send email registered
 * Server check email is valid or not
 * if email valid => send mail + link (password changed token)
 * Client check mail => click the link
 * Client send api have token
 * Sever check token the same token the server sent
 * If same => change password
*/

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.query;

    if (!email) throw new Error("Missing email");

    const user = await User.findOne({email: email});

    if (!user) throw new Error("User not found");

    const resetToken = user.createPasswordChangedToken();
    
    await user.save();

    const html = `
        <h1>Password Change Request</h1>
        <div>We've received a password change request for your Cuahangdientu account.</div>
        <div>This link will expire in 15 minutes. If you did not request a password change, please ignore this email, no changes will be made to your account.</div>
        <div>To change your password, click the link below:</div>
        <a href="${process.env.URL_SERVER}/api/user/reset-password/${resetToken}">Click here</a>
    `;

    const data = {
        email: email,
        html: html
    }

    const result = await sendMail(data);

    return res.status(200).json({
        success: true,
        message: result
    });
});

const resetPassword = asyncHandler(async (req, res) => {
    const { password, token } = req.body;

    if (!password || !token) throw new Error("Missing input");

    const passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({passwordResetToken: passwordResetToken, passwordResetExpires: {$gt: Date.now()}}); // passwordResetExpires > Date.now()

    if (!user) throw new Error("Invalid reset token");

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordChangedAt = Date.now();
    user.passwordResetExpires = undefined;
    await user.save();

    return res.status(200).json({
        success: user ? true : false,
        message: user ? "Updated password" : "Something went wrong"
    });
});

const getUsers = asyncHandler(async (req, res) => { 
    const response = await User.find().select("-password -refreshToken -role -passwordChangedAt -passwordResetExpires -passwordResetToken");;

    return res.status(200).json({
        success: response ? true : false,
        users: response
    });
});

const deleteUser = asyncHandler(async (req, res) => { 
    const { _id } = req.query;

    if (!_id) throw new Error("Missing id");

    const response = await UserService.deleteUser(_id);

    return res.status(200).json({
        success: response ? true : false,
        deletedUser: response ? `User with email ${response.email} deleted` : `No user delete`
    });
});

const updateUser = asyncHandler(async (req, res) => { 
    const { _id } = req.user;

    if (!_id || Object.keys(req.body).length === 0) throw new Error("Missing id");

    const response = await UserService.updateUser(_id, req.body);

    return res.status(200).json({
        success: response ? true : false,
        updatedUser: response ? response : `Some thing went wrong`
    });
});

const updateUserByAdmin = asyncHandler(async (req, res) => { 
    const { uid } = req.params;
    
    if (Object.keys(req.params).length === 0) throw new Error("Missing id");

    const response = await UserService.updateUserByAdmin(uid, req.body);

    return res.status(200).json({
        success: response ? true : false,
        updatedUser: response ? response : `Some thing went wrong`
    });
});

module.exports = {
    register,
    login,
    getUser,
    refreshAccessToken,
    logout,
    forgotPassword,
    resetPassword,
    getUsers,
    deleteUser,
    updateUser,
    updateUserByAdmin
}