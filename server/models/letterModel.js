const mongoose = require('mongoose'); // Erase if already required
const FileSchema = require('./fileModel');

// Declare the Schema of the Mongo model
var letterSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to User model
        ref: 'User', // Refers to the User model
        required: true
    },
    soDen:{
        type:Number,
        required:true
    },
    ngayDen:{
        type:Date,
        required:true
    },
    soVanBan:{
        type:Number
    },
    ngayDon:{
        type:Date,
        required:true
    },
    nguoiGui:{
        type:String,
        required:true,
    },
    diaChi:{
        type:String,
        required:true,
    },
    lanhDao:{
        type:String,
        required:true,
    },
    chuyen1:{
        type:String
    },
    chuyen2:{
        type:String
    },
    ghiChu:{
        type:String
    },
    trichYeu:{
        type:String
    },
    files: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'File'
        },
        name: {
            type:String
        },
        size: {
            type:Number
        },
        type: {
            type:String
        },
        path: {
            type:String
        },
    }]
}, {
    timestamps: true
});
//Export the model
module.exports = mongoose.model('Letter', letterSchema);