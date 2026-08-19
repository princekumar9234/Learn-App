const app = require('../src/app');
const { connectDB } = require('../src/dataBase/db');
const { seedDefaultAdmin } = require('../src/dataBase/seed');

let isInit = false;

module.exports = async (req, res) => {
    if (!isInit) {
        try {
            await connectDB();
            await seedDefaultAdmin();
        } catch (err) {
            console.error("Vercel DB Init Error:", err);
        }
        isInit = true;
    }
    return app(req, res);
};
