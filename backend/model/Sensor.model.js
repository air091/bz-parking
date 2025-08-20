const { pool } = require("../database/Database.js");

class Sensor {
  static startAutmation() {
    console.log("Sensor autimation...");
    setInterval(async () => {
      await this.updateSensorData();
    }, 30000);
    console.log("Aumation started - updates sensor data every second");
  }

  static async updateSensorData() {
    try {
      const query = `SELECT sensor_id, status FROM sensors`;
      const [sensors] = await pool.execute(query);
      // update working sensor with random data
      for (const sensor of sensors) {
        if (sensor.status === "working") {
          await this.updateSingleSensor(sensor.sensor_id);
        } else if (sensor.status === "defective") {
          await this.handleDefectiveSensor(sensor.sensor_id);
        }
      }
    } catch (error) {
      console.log("Error updating sensor data:", error.message);
    }
  }

  static async updateSingleSensor(sensorId) {
    const connection = await pool.getConnection();
    try {
      // start transaction data to ensure data consistency
      await connection.beginTransaction();

      const sensorData = Math.floor(Math.random() * 101);
      const queryUpdateSensorData = `UPDATE sensors SET sensor_data = ? WHERE sensor_id = ?`;
      await connection.execute(queryUpdateSensorData, [sensorData, sensorId]);

      const slotStatus = sensorData < 50 ? "occupied" : "available";

      // Get current slot status to check if it's changing
      const queryGetCurrentStatus = `SELECT status FROM parking_slots WHERE sensor_id = ?`;
      const [currentStatusResult] = await connection.execute(
        queryGetCurrentStatus,
        [sensorId]
      );
      const currentStatus = currentStatusResult[0]?.status;

      const queryUpdateParkingSlotStatus = `UPDATE parking_slots SET status = ? WHERE sensor_id = ?`;
      await connection.execute(queryUpdateParkingSlotStatus, [
        slotStatus,
        sensorId,
      ]);

      // Handle parking activity changes
      if (slotStatus === "occupied" && currentStatus === "available") {
        await this.handleSlotOccupied(connection, sensorId, sensorData);
      } else if (slotStatus === "available" && currentStatus === "occupied") {
        await this.handleSlotVacated(connection, sensorId, sensorData);
      } else if (slotStatus === "occupied" && currentStatus === "occupied") {
        // Slot was already occupied, show current occupant
        await this.showCurrentOccupant(connection, sensorId, sensorData);
      } else {
        // Slot is available and stays available
        console.log(`Sensor ${sensorId}: ${sensorData} -> Slot: available`);
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      console.error(`Error updating sensor ${sensorId}`, error.message);
    } finally {
      connection.release();
    }
  }

  static async handleDefectiveSensor(sensor_id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // sensor data for defective
      const queryUpdateSensorData = `UPDATE sensors SET sensor_data = 0 WHERE sensor_id = ?`;
      await connection.execute(queryUpdateSensorData, [sensor_id]);

      // set parking slot to maintenance
      const queryUpdateParkingSlotStatus = `UPDATE parking_slots SET status = "maintenace" WHERE sensor_id = ?`;
      await connection.execute(queryUpdateParkingSlotStatus, [sensor_id]);

      await connection.commit();
      console.log(`🔧 Sensor ${sensor_id}: DEFECTIVE -> Slot: maintenace`);
    } catch (error) {
      await connection.rollback();
      console.error("Error handling defective sensor:", error.message);
    } finally {
      connection.release();
    }
  }

  static async handleSlotOccupied(connection, sensorId, sensorData) {
    try {
      // Step 1: Get a random existing user from the database
      const userQuery = `SELECT user_id, first_name, last_name, user_type FROM users ORDER BY RAND() LIMIT 1`;
      const [userResult] = await connection.execute(userQuery);

      if (userResult.length === 0) {
        console.log(
          "⚠️ No users found in database, skipping parking activity creation"
        );
        return;
      }

      const selectedUser = userResult[0];
      const userId = selectedUser.user_id;
      const userName = `${selectedUser.first_name} ${selectedUser.last_name}`;

      // Step 2: Get parking slot information
      const slotQuery = `SELECT slot_id, location FROM parking_slots WHERE sensor_id = ?`;
      const [slotResult] = await connection.execute(slotQuery, [sensorId]);
      const slotId = slotResult[0].slot_id;

      // Step 3: Create new parking activity with start_time
      const activityQuery = `INSERT INTO parking_activities (user_id, parking_slot_id, start_time) 
                            VALUES (?, ?, NOW())`;
      await connection.execute(activityQuery, [userId, slotId]);

      // Format console log as requested
      console.log(
        `Sensor ${sensorId}: ${sensorData} -> Slot: occupied -> User: ${userName} (ID: ${userId})`
      );
    } catch (error) {
      console.error("Error handling slot occupied:", error.message);
      throw error;
    }
  }

  static async handleSlotVacated(connection, sensorId, sensorData) {
    try {
      // Get parking slot information
      const slotQuery = `SELECT slot_id FROM parking_slots WHERE sensor_id = ?`;
      const [slotResult] = await connection.execute(slotQuery, [sensorId]);
      const slotId = slotResult[0].slot_id;

      // Update the most recent parking activity for this slot to set end_time
      const updateQuery = `UPDATE parking_activities 
                          SET end_time = NOW() 
                          WHERE parking_slot_id = ? 
                          AND end_time IS NULL 
                          ORDER BY start_time DESC 
                          LIMIT 1`;
      const [updateResult] = await connection.execute(updateQuery, [slotId]);

      if (updateResult.affectedRows > 0) {
        // Get the updated activity details
        const activityQuery = `SELECT pa.parking_act_id, u.first_name, u.last_name, u.user_id, pa.duration_time
                              FROM parking_activities pa
                              JOIN users u ON pa.user_id = u.user_id
                              WHERE pa.parking_slot_id = ? 
                              AND pa.end_time IS NOT NULL
                              ORDER BY pa.end_time DESC 
                              LIMIT 1`;
        const [activityResult] = await connection.execute(activityQuery, [
          slotId,
        ]);

        if (activityResult.length > 0) {
          const activity = activityResult[0];
          const userName = `${activity.first_name} ${activity.last_name}`;
          const duration = activity.duration_time;
          const parkingActId = activity.parking_act_id;

          // Generate payment for completed parking activity
          await this.generatePayment(connection, parkingActId, duration);

          console.log(
            `Sensor ${sensorId}: ${sensorData} -> Slot: available -> User: ${userName} (ID: ${activity.user_id}) - Duration: ${duration}s`
          );
        }
      } else {
        console.log(`Sensor ${sensorId}: ${sensorData} -> Slot: available`);
      }
    } catch (error) {
      console.error("Error handling slot vacated:", error.message);
      throw error;
    }
  }

  static async generatePayment(connection, parkingActId, durationSeconds) {
    try {
      // Calculate amount based on duration
      const amount = this.calculateParkingFee(durationSeconds);

      // Generate random payment status (eventually becomes true)
      const isPaid = Math.random() < 0.7; // 70% chance of being paid

      // Generate payment method only if paid
      let paymentMethod = "N/A";
      if (isPaid) {
        const methods = ["gcash", "paymaya", "cash"];
        paymentMethod = methods[Math.floor(Math.random() * methods.length)];
      }

      // Insert payment record
      const paymentQuery = `INSERT INTO payments (parking_act_id, amount, is_paid, payment_method) 
                           VALUES (?, ?, ?, ?)`;
      const [paymentResult] = await connection.execute(paymentQuery, [
        parkingActId,
        amount,
        isPaid,
        paymentMethod,
      ]);

      console.log(
        ` Payment generated: PHP ${amount} (${
          isPaid ? paymentMethod : "Unpaid"
        }) for activity ${parkingActId}`
      );
    } catch (error) {
      console.error("Error generating payment:", error.message);
      throw error;
    }
  }

  static calculateParkingFee(durationSeconds) {
    // Convert seconds to minutes for demo (treating 1 second = 1 minute)
    const durationMinutes = Math.ceil(durationSeconds / 60);

    let totalAmount = 0;

    if (durationMinutes >= 1) {
      // First minute: PHP 30
      totalAmount += 30;
    }

    if (durationMinutes >= 2) {
      // Second minute: PHP 40
      totalAmount += 40;
    }

    if (durationMinutes >= 3) {
      // Third minute onwards: PHP 30 each
      const additionalMinutes = durationMinutes - 2;
      totalAmount += additionalMinutes * 30;
    }

    return totalAmount;
  }

  static async showCurrentOccupant(connection, sensorId, sensorData) {
    try {
      // Get the current occupant for this slot
      const occupantQuery = `SELECT u.first_name, u.last_name, u.user_id, pa.parking_act_id
                            FROM parking_activities pa
                            JOIN users u ON pa.user_id = u.user_id
                            WHERE pa.parking_slot_id = (SELECT slot_id FROM parking_slots WHERE sensor_id = ?)
                            AND pa.end_time IS NULL
                            ORDER BY pa.start_time DESC
                            LIMIT 1`;
      const [occupantResult] = await connection.execute(occupantQuery, [
        sensorId,
      ]);

      if (occupantResult.length > 0) {
        const occupant = occupantResult[0];
        const userName = `${occupant.first_name} ${occupant.last_name}`;
        console.log(
          `Sensor ${sensorId}: ${sensorData} -> Slot: occupied -> User: ${userName} (ID: ${occupant.user_id})`
        );
      } else {
        // Slot is occupied but no parking activity found (shouldn't happen, but just in case)
        console.log(
          `Sensor ${sensorId}: ${sensorData} -> Slot: occupied -> User: Unknown`
        );
      }
    } catch (error) {
      console.error("Error showing current occupant:", error.message);
      throw error;
    }
  }

  static async getAllSensors() {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const query = `SELECT * FROM sensors`;
      const [rows] = await connection.execute(query);
      await connection.commit();

      return rows;
    } catch (error) {
      await connection.rollback();
      console.error("Error getting all sensors:", error.message);
    } finally {
      connection.release();
    }
  }

  static async getSingleSensor(sensorId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const query = `SELECT * FROM sensors WHERE sensor_id = ?`;
      const [rows] = await connection.execute(query, [sensorId]);

      await connection.commit();
      return rows;
    } catch (error) {
      await connection.rollback();
      console.error(
        `Error getting "sensor id: ${sensorId}" sensors:`,
        error.message
      );
    } finally {
      connection.release();
    }
  }

  static async updateSingleSensorManual(sensorId, sensorInformation) {
    const connection = await pool.getConnection();
    try {
      const fields = [];
      const values = [];

      if (sensorInformation.sensorType !== undefined) {
        fields.push("sensorType = ?");
        values.push(sensorInformation.sensorType);
      }

      if (sensorInformation.status !== undefined) {
        fields.push("status = ?");
        values.push(sensorInformation.status);
      }
      values.push(sensorId);

      await connection.beginTransaction();
      const query = `UPDATE sensors
                    SET ${fields.join(", ")}
                    WHERE sensor_id = ?`;
      const [rows] = await connection.execute(query, values);
      await connection.commit();

      if (rows.affectedRows === 0) return [];
      return rows;
    } catch (error) {
      await connection.rollback();
      console.error(
        `Error updating "sensor id: ${sensorId}" sensors:`,
        error.message
      );
    } finally {
      connection.release();
    }
  }

  static async deleteSingleSensor(sensorId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const query = `DELETE FROM sensors WHERE sensor_id = ?`;
      const [rows] = await connection.execute(query, [sensorId]);

      if (rows.affectedRows === 0) return [];

      await connection.commit();
      return rows;
    } catch (error) {
      await connection.rollback();
      console.error(
        `Error getting "sensor id: ${sensorId}" sensors:`,
        error.message
      );
    } finally {
      connection.release();
    }
  }
}

module.exports = Sensor;
