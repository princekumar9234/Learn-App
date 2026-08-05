require("dotenv").config();
const app = require("./src/app");
const { connectDB } = require("./src/dataBase/db");
const { seedDefaultAdmin } = require("./src/dataBase/seed");

// ─── Crash Prevention ─────────────────────────────────────────────────────────
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception (server kept running):", err.message);
});

process.on("unhandledRejection", (reason) => {
  console.error(
    "❌ Unhandled Promise Rejection (server kept running):",
    reason,
  );
});

// ─── Environment Info ─────────────────────────────────────────────────────────
const useCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

console.log(
  "--------------------------------------------------------------------------------",
);
console.log("Checking Environment & Configuration...");
console.log("Using Cloudinary:", useCloudinary ? "YES" : "NO");
console.log(
  "--------------------------------------------------------------------------------",
);

if (!useCloudinary) {
  console.warn(
    "WARNING: Cloudinary credentials missing. Files will be deleted on Render restart.",
  );
}
if (!process.env.MONGO_URI) {
  console.warn(
    "WARNING: MONGO_URI is missing. Using local database (will not work on Render).",
  );
}

app.locals.useCloudinary = useCloudinary;

// ─── Start Server ─────────────────────────────────────────────────────────────
async function startServer() {
  console.log(`Attempting to connect to database...`);
  await connectDB();
  await seedDefaultAdmin();

  const PORT = process.env.PORT;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
