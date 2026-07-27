const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    type: {
        type: String,
        enum: ['video', 'article', 'pdf', 'link'],
        required: true
    },
    url: {
        type: String,
        required: true
    },
    category: {
        type: String, // HTML, CSS, JS, Node, MongoDB, Projects
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Resource', resourceSchema);
