const express = require("express");
const SensorController = require("../controllers/Sensor.controller");

const sensorRoutes = express.Router();

sensorRoutes.get("/", SensorController.getAllSensors);
sensorRoutes.get("/:id", SensorController.getSingleSensor);
sensorRoutes.put("/:id", SensorController.updateSingleSensor);
sensorRoutes.delete("/:id", SensorController.deleteSingleSensor);

module.exports = sensorRoutes;
