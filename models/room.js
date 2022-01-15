const mongoose = require('mongoose');
const { Schema } = mongoose;

const roomSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        maxLength: 20
    },
    host: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    guest: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model('Room', roomSchema);