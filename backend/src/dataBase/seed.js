const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

async function seedDefaultAdmin() {
    try {
        const email = 'princechouhan9939@gmail.com';
        const plainPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'PRINCE@18';
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        await Admin.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { upsert: true, new: false }
        );
        console.log('Default Admin ensured:', email, '/', plainPassword);
    } catch (err) {
        console.error('Error seeding admin:', err);
    }
}

module.exports = { seedDefaultAdmin };
