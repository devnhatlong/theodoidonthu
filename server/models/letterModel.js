const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var letterSchema = new mongoose.Schema({
    soDen:{
        type:Number,
        required:true,
        unique:true
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
    chiChu:{
        type:String
    },
    trichYeu:{
        type:String
    },
}, {
    timestamps: true
});
//Export the model
module.exports = mongoose.model('Letter', letterSchema);