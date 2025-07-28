const express = require("express");
const parkingSlotController = require("../controllers/ParkingSlot.controller");

const parkingSlotRoutes = express.Router();

parkingSlotRoutes.get("/", parkingSlotController.getAllParkingSlots);
parkingSlotRoutes.get("/:id", parkingSlotController.getSingleParkingSlot);
parkingSlotRoutes.post("/:id", parkingSlotController.insertNewParkingSlot);
parkingSlotRoutes.put("/:id", parkingSlotController.updateSingleParkingSlot);
parkingSlotRoutes.delete("/:id", parkingSlotController.deleteSingleParkingSlot);

module.exports = parkingSlotRoutes;
