const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

// Since admin is usually created manually or seeded, we might not strictly need pre-save hash hook if we seed it hashed, BUT for completeness and if we add 'create admin' later:
adminSchema.methods.comparePassword = async function(candidatePassword) {
    // In a real app, hash the password. For simplicity in seed, we will store hashed.
    // Assuming the password in DB is hashed.
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
