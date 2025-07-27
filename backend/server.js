const express = require("express");
const cors = require("cors");
const Sensor = require("./model/Sensor.model.js");
const ParkingSlot = require("./model/ParkingSlot.model.js");
const { testConnection } = require("./database/Database.js");
require("dotenv").config();

const app = express();
const port = process.env.SERVER_PORT;

app.use(cors());
app.use(express.json());

async function startServer() {
  try {
    await testConnection();
    Sensor.startAutmation();
    app.listen(port, () => {
      console.log("Server running on port:", port);
    });
  } catch (error) {
    console.log("Failed to start server:", error.message);
    process.exit(1);
  }
}

// handle shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down server...");
  process.exit(0);
});

startServer();
