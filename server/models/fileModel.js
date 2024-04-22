const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var fileSchema = new mongoose.Schema({
    name: String,
    size: Number,
    type: String,
    data: Buffer // Lưu trữ dữ liệu thực tế của tệp trong dạng Buffer
});

//Export the model
module.exports = mongoose.model('FileSchema', fileSchema);