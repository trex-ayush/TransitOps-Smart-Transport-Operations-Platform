const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "TransitOps API is running" });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/vehicles", require("./routes/vehicleRoutes"));
app.use("/api/drivers", require("./routes/driverRoutes"));
app.use("/api/trips", require("./routes/tripRoutes"));
app.use("/api/maintenance", require("./routes/maintenanceRoutes"));
app.use("/api/fuel", require("./routes/fuelRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

module.exports = app;
