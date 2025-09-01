const express = require("express");
const ParkingActivityController = require("../controllers/ParkingActivity.controller.js");
const parkingActivityRoutes = express.Router();

parkingActivityRoutes.get(
  "/",
  ParkingActivityController.getAllParkingActivities
);
parkingActivityRoutes.get(
  "/:parking_act_id",
  ParkingActivityController.getSingleParkingActivity
);
parkingActivityRoutes.post(
  "/",
  ParkingActivityController.createParkingActivity
);
parkingActivityRoutes.put(
  "/:parking_act_id",
  ParkingActivityController.updateParkingActivity
);
parkingActivityRoutes.delete(
  "/:parking_act_id",
  ParkingActivityController.deleteParkingActivity
);
parkingActivityRoutes.get(
  "/user/:user_id",
  ParkingActivityController.getParkingActivitiesByUser
);
// New route to end parking activity by slot
parkingActivityRoutes.put(
  "/end/:parking_slot_id",
  ParkingActivityController.endParkingActivity
);

// New route to get active parking activity by slot
parkingActivityRoutes.get(
  "/slot/:parking_slot_id/active",
  ParkingActivityController.getActiveParkingActivityBySlot
);

module.exports = parkingActivityRoutes;
