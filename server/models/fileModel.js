const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var fileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to User model
        ref: 'User', // Refers to the User model
        required: true
    },
    soDen:{
        type:Number,
        required:true
    },
    name: String,
    size: Number,
    type: String,
    path: String
});

//Export the model
module.exports = mongoose.model('File', fileSchema);