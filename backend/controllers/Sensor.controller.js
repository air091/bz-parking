const Sensor = require("../model/Sensor.model.js");

class SensorController {
  static async getAllSensors(request, response) {
    try {
      const sensors = await Sensor.getAllSensors();
      response.status(200).json({ success: true, sensors: sensors });
    } catch (error) {
      console.log("Error sensor controller:", error.message);
      response.status(500).json({
        success: false,
        message: "Sensor controller error",
        errorMessage: error.message,
      });
    }
  }

  static async getSingleSensor(request, response) {
    try {
      const { id } = request.params;
      const sensor = await Sensor.getSingleSensor(id);

      if (sensor.length === 0)
        return response
          .status(404)
          .json({ success: false, message: "Sensor not found." });

      response.status(200).json({ success: true, sensor: sensor });
    } catch (error) {
      console.log("Error sensor controller:", error.message);
      response.status(500).json({
        success: false,
        message: "Sensor controller error",
        errorMessage: error.message,
      });
    }
  }

  static async deleteSingleSensor(request, response) {
    try {
      const { id } = request.params;
      const sensor = await Sensor.deleteSingleSensor(id);
      console.log(sensor);
      if (sensor.length === 0)
        return response
          .status(404)
          .json({ success: false, message: "Sensor not found." });
      response
        .status(200)
        .json({ success: true, message: "Sensor deleted successfuly" });
    } catch (error) {
      console.log("Error sensor controller:", error.message);
      response.status(500).json({
        success: false,
        message: "Sensor controller error",
        errorMessage: error.message,
      });
    }
  }
}

module.exports = SensorController;
