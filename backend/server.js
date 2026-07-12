// Local / traditional (non-Lambda) entry point.
require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

connectDB().catch((err) => {
  console.error("Initial MongoDB connection failed:", err.message);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
