const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var fileSchema = new mongoose.Schema({
    name: String,
    size: Number,
    type: String,
    path: String
});

//Export the model
module.exports = mongoose.model('FileSchema', fileSchema);