const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    grid: {
        type: [[Number]],
        required: true,
    },
    cutNumbers: {
        type: [Number],
        default: [],
    },
    status: {
        type: String,
        default: 'playing',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', UserSchema);
