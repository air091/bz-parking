const ParkingActivity = require("../model/ParkingActivity.model.js");

class ParkingActivityController {
  static getAllParkingActivities = async (request, response) => {
    try {
      const parkingActivities = await ParkingActivity.getAllParkingActivities();
      response.status(200).json({
        success: true,
        parkingActivities: parkingActivities,
      });
    } catch (error) {
      console.log("Error getting parking activities");
      response.status(500).json({
        success: false,
        errorMessage: `Parking activity err: ${error.message}`,
      });
    }
  };

  static getSingleParkingActivity = async (request, response) => {
    try {
      const { parking_act_id } = request.params;
      const parkingActivity = await ParkingActivity.getSingleParkingActivity(
        parking_act_id
      );

      if (parkingActivity.length === 0) {
        return response.status(404).json({
          success: false,
          errorMessage: "Parking activity not found",
        });
      }

      response.status(200).json({
        success: true,
        parkingActivity: parkingActivity[0],
      });
    } catch (error) {
      console.log("Error getting single parking activity");
      response.status(500).json({
        success: false,
        errorMessage: `Parking activity err: ${error.message}`,
      });
    }
  };

  static createParkingActivity = async (request, response) => {
    try {
      const { user_id, parking_slot_id, start_time } = request.body;

      if (!user_id || !parking_slot_id) {
        return response.status(400).json({
          success: false,
          errorMessage: "Missing required fields: user_id, parking_slot_id",
        });
      }

      const parkingActivityData = {
        user_id,
        parking_slot_id,
        start_time: start_time || new Date().toISOString(),
      };

      const parking_act_id = await ParkingActivity.createParkingActivity(
        parkingActivityData
      );

      response.status(201).json({
        success: true,
        message: "Parking activity created successfully",
        parking_activity_id: parking_act_id,
      });
    } catch (error) {
      console.log("Error creating parking activity:", error);
      response.status(500).json({
        success: false,
        errorMessage: `Parking activity creation error: ${error.message}`,
      });
    }
  };

  static updateParkingActivity = async (request, response) => {
    try {
      const { parking_act_id } = request.params;
      const { end_time } = request.body;

      if (!end_time) {
        return response.status(400).json({
          success: false,
          errorMessage: "Missing required field: end_time",
        });
      }

      const updateData = { end_time };
      const success = await ParkingActivity.updateParkingActivity(
        parking_act_id,
        updateData
      );

      if (success) {
        response.status(200).json({
          success: true,
          message: "Parking activity updated successfully",
        });
      } else {
        response.status(404).json({
          success: false,
          errorMessage: "Parking activity not found",
        });
      }
    } catch (error) {
      console.log("Error updating parking activity:", error);
      response.status(500).json({
        success: false,
        errorMessage: `Parking activity update error: ${error.message}`,
      });
    }
  };

  static deleteParkingActivity = async (request, response) => {
    try {
      const { parking_act_id } = request.params;
      const result = await ParkingActivity.deleteSingleParkingActivity(
        parking_act_id
      );

      if (result.length === 0) {
        return response.status(404).json({
          success: false,
          errorMessage: "Parking activity not found",
        });
      }

      response.status(200).json({
        success: true,
        message: "Parking activity deleted successfully",
      });
    } catch (error) {
      console.log("Error deleting parking activity");
      response.status(500).json({
        success: false,
        errorMessage: `Parking activity deletion error: ${error.message}`,
      });
    }
  };

  static getParkingActivitiesByUser = async (request, response) => {
    try {
      const { user_id } = request.params;
      const parkingActivities =
        await ParkingActivity.getParkingActivitiesByUser(user_id);

      response.status(200).json({
        success: true,
        parkingActivities: parkingActivities,
      });
    } catch (error) {
      console.log("Error getting parking activities by user");
      response.status(500).json({
        success: false,
        errorMessage: `Parking activity err: ${error.message}`,
      });
    }
  };

  static getActiveParkingActivityBySlot = async (request, response) => {
    try {
      const { parking_slot_id } = request.params;
      const activeActivity =
        await ParkingActivity.getActiveParkingActivityBySlot(parking_slot_id);

      if (!activeActivity) {
        return response.status(404).json({
          success: false,
          errorMessage: "No active parking activity found for this slot",
        });
      }

      response.status(200).json({
        success: true,
        parkingActivity: activeActivity,
      });
    } catch (error) {
      console.log("Error getting active parking activity by slot:", error);
      response.status(500).json({
        success: false,
        errorMessage: `Parking activity err: ${error.message}`,
      });
    }
  };

  static endParkingActivity = async (request, response) => {
    try {
      const { parking_slot_id } = request.params;
      const { end_time } = request.body;

      // Get the active parking activity for this slot
      const activeActivity =
        await ParkingActivity.getActiveParkingActivityBySlot(parking_slot_id);

      if (!activeActivity) {
        return response.status(404).json({
          success: false,
          errorMessage: "No active parking activity found for this slot",
        });
      }

      // End the parking activity
      const success = await ParkingActivity.endParkingActivity(
        activeActivity.parking_act_id,
        end_time
      );

      if (success) {
        response.status(200).json({
          success: true,
          message: "Parking activity ended successfully",
          parking_activity_id: activeActivity.parking_act_id,
        });
      } else {
        response.status(500).json({
          success: false,
          errorMessage: "Failed to end parking activity",
        });
      }
    } catch (error) {
      console.log("Error ending parking activity:", error);
      response.status(500).json({
        success: false,
        errorMessage: `Parking activity end error: ${error.message}`,
      });
    }
  };
}

module.exports = ParkingActivityController;
