const mongoose = require('mongoose');
const dns = require("dns");

try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (err) {
    console.warn("Custom DNS setServers not supported in this environment, using default DNS.");
}

let isConnected = false;

async function connectDB() {
    if (isConnected || mongoose.connection.readyState === 1) {
        return;
    }
    if (!process.env.MONGO_URI) {
        console.warn("WARNING: MONGO_URI is missing.");
        return;
    }
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("✅ dataBase connected successfully");
}

const dbUri = process.env.MONGO_URI;

module.exports = { connectDB, dbUri };
