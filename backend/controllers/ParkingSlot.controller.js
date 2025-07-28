const ParkingSlot = require("../model/ParkingSlot.model.js");

class parkingSlotController {
  static async insertNewParkingSlot(request, response) {
    try {
      const { location, sensor_id } = request.body;
      const newParkingSlot = await ParkingSlot.insertSingleParkingSlot(
        location,
        sensor_id
      );

      response.status(200).json({ success: true, parkingSlot: newParkingSlot });
    } catch (error) {
      console.log("Error parking slot error");
      console.log("Error message:", error.message);
      response.status(500).json({
        success: false,
        message: "Error parking slot error",
        errorMessage: error.message,
      });
    }
  }

  static async getAllParkingSlots(request, response) {
    try {
      const parkingSlots = await ParkingSlot.getAllParkingSlots();
      if (parkingSlots.length === 0)
        return response
          .status(404)
          .json({ success: false, message: "No parking slots yet" });
      response.status(200).json({ success: true, parkingSlots: parkingSlots });
    } catch (error) {
      console.log("Error parking slot error");
      console.log("Error message:", error.message);
      response.status(500).json({
        success: false,
        message: "Error parking slot error",
        errorMessage: error.message,
      });
    }
  }

  static async getSingleParkingSlot(request, response) {
    try {
      const { id } = request.params;
      const parkingSlot = await ParkingSlot.getSingleParkingSlot(id);
      if (parkingSlot.length === 0)
        return response
          .status(404)
          .json({ success: false, message: "No parking slot found" });
      response.status(200).json({ success: true, parkingSlot: parkingSlot });
    } catch (error) {
      console.log("Error parking slot error");
      console.log("Error message:", error.message);
      response.status(500).json({
        success: false,
        message: "Error parking slot error",
        errorMessage: error.message,
      });
    }
  }

  static async updateSingleParkingSlot(request, response) {
    try {
      const { id } = request.params;
      const { location, status, sensorId } = request.body;
      const updatedParkingSlot = await ParkingSlot.updateParkingSlotsData(id, {
        location: location,
        status: status,
        sensorId: sensorId,
      });
      if (updatedParkingSlot.length === 0)
        return response
          .status(404)
          .json({ success: false, message: "Parking slot not found" });
      response
        .status(200)
        .json({ success: true, message: "Parking slot updated successfully" });
    } catch (error) {
      console.log("Error parking slot error");
      console.log("Error message:", error.message);
      response.status(500).json({
        success: false,
        message: "Error parking slot error",
        errorMessage: error.message,
      });
    }
  }

  static async deleteSingleParkingSlot(request, response) {
    try {
      const { id } = request.params;
      const deletedParkingSlot = await ParkingSlot.deleteSingleParkingSlot(id);

      if (deletedParkingSlot.length === 0)
        return response
          .status(404)
          .json({ success: false, message: "Parking slot not found" });

      response
        .status(200)
        .json({ success: true, message: "Parking slot deleted successfully" });
    } catch (error) {
      console.log("Error parking slot error");
      console.log("Error message:", error.message);
      response.status(500).json({
        success: false,
        message: "Error parking slot error",
        errorMessage: error.message,
      });
    }
  }
}

module.exports = parkingSlotController;
