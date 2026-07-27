const mongoose = require('mongoose');
const dns = require("dns")
dns.setServers(["8.8.8.8", "8.8.4.4"]);

async function connectDB() {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("✅ dataBase connected successfully")
}

const dbUri = process.env.MONGO_URI;

module.exports = { connectDB, dbUri };
