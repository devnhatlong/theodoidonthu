const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    userName: {
        type:String,
        required:true,
        unique: true
    },
    password: {
        type:String,
        required:true,
    },
    departmentName: {
        type:String,
        // unique: true
    },
    role: {
        type:String,
        default: "user",
    },
    refreshToken: {
        type: String,
    },
    passwordChangedAt: {
        type: String
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: String
    },
}, {
    timestamps: true
});

/**
 * không dùng arrow func vì arrow func ko dùng được this
 * Khi dùng các api không liên quan đến update ví dụ create hoặc save thì nó sẽ trigger đến đoạn code dưới  
*/

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) {
        next();
    }
    
    const salt = bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods = {
    isCorrectPassword: async function (password) {
        return await bcrypt.compare(password, this.password);
    },
    createPasswordChangedToken: function () {
        const resetToken = crypto.randomBytes(32).toString("hex");

        this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        this.passwordResetExpires = Date.now() + 15 * 60 * 1000;

        return resetToken;
    }
}

//Export the model
module.exports = mongoose.model('User', userSchema);