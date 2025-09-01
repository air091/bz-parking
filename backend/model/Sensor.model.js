const { pool } = require("../database/Database.js");

class Sensor {
  static startAutmation() {
    console.log("Sensor autmation...");
    setInterval(async () => {
      await this.updateSensorData();
    }, 300000);
    console.log("Aumation started - updates sensor data every second");
  }

  static async updateSensorData() {
    try {
      const query = `SELECT sensor_id, status FROM sensors`;
      const [sensors] = await pool.execute(query);

      for (const sensor of sensors) {
        const randomData = Math.floor(Math.random() * 100) + 1;

        // Update sensor data
        await this.updateSingleSensorData(sensor.sensor_id, randomData);

        // Check if this sensor is associated with a parking slot
        const slotQuery = `SELECT slot_id, status FROM parking_slots WHERE sensor_id = ?`;
        const [slots] = await pool.execute(slotQuery, [sensor.sensor_id]);

        if (slots.length > 0) {
          const slot = slots[0];

          // Check if there's an active hold for this slot
          const holdQuery = `
            SELECT ht.*, u.user_id, u.username 
            FROM hold_transactions ht 
            JOIN users u ON ht.user_id = u.user_id 
            WHERE ht.parking_slot_id = ? AND ht.end_time IS NULL
            ORDER BY ht.start_time DESC 
            LIMIT 1
          `;
          const [holds] = await pool.execute(holdQuery, [slot.slot_id]);

          if (holds.length > 0) {
            const activeHold = holds[0];

            // Only update to occupied if there's an active hold AND sensor detects occupancy
            if (randomData < 50 && slot.status !== "occupied") {
              // Update slot to occupied
              await this.updateParkingSlotStatus(slot.slot_id, "occupied");

              // Create parking activity for the user who holds the slot
              await this.createParkingActivity(
                activeHold.user_id,
                slot.slot_id
              );

              console.log(
                `Slot ${slot.slot_id} occupied by user ${activeHold.username}`
              );
            } else if (randomData >= 50 && slot.status === "occupied") {
              // Check if this user is still occupying (within reasonable time)
              const activityQuery = `
                SELECT * FROM parking_activities 
                WHERE parking_slot_id = ? AND end_time IS NULL
                ORDER BY start_time DESC LIMIT 1
              `;
              const [activities] = await pool.execute(activityQuery, [
                slot.slot_id,
              ]);

              if (activities.length > 0) {
                const activity = activities[0];
                const timeDiff = Math.floor(
                  (Date.now() - new Date(activity.start_time)) / 1000 / 60
                ); // minutes

                // If user has been occupying for more than 5 minutes without sensor detection, end occupancy
                if (timeDiff > 5) {
                  await this.endParkingActivity(activity.parking_act_id);
                  await this.updateParkingSlotStatus(slot.slot_id, "available");
                  console.log(`Slot ${slot.slot_id} freed - user left`);
                }
              }
            }
          } else {
            // No active hold - sensor data shouldn't affect slot status
            // Only update if slot is currently occupied but no hold exists
            if (slot.status === "occupied") {
              const activityQuery = `
                SELECT * FROM parking_activities 
                WHERE parking_slot_id = ? AND end_time IS NULL
                ORDER BY start_time DESC LIMIT 1
              `;
              const [activities] = await pool.execute(activityQuery, [
                slot.slot_id,
              ]);

              if (activities.length > 0) {
                const activity = activities[0];
                const timeDiff = Math.floor(
                  (Date.now() - new Date(activity.start_time)) / 1000 / 60
                );

                // If no hold and sensor shows available, end occupancy after 2 minutes
                if (randomData >= 50 && timeDiff > 2) {
                  await this.endParkingActivity(activity.parking_act_id);
                  await this.updateParkingSlotStatus(slot.slot_id, "available");
                  console.log(
                    `Slot ${slot.slot_id} freed - no hold and sensor available`
                  );
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.log("Error in updateSensorData: ", error);
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
      if (
        slotStatus === "occupied" &&
        (currentStatus === "available" || currentStatus === "held")
      ) {
        await this.handleSlotOccupied(connection, sensorId, sensorData);
      } else if (slotStatus === "available" && currentStatus === "occupied") {
        await this.handleSlotVacated(connection, sensorId, sensorData);
      } else if (slotStatus === "occupied" && currentStatus === "occupied") {
        // Slot was already occupied, show current occupant
        await this.showCurrentOccupant(connection, sensorId, sensorData);
      } else if (slotStatus === "available" && currentStatus === "held") {
        // Slot was held but sensor shows available (shouldn't happen often, but handle it)
        console.log(
          `Sensor ${sensorId}: ${sensorData} -> Slot: available (was held)`
        );
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

      if (sensorInformation.data !== undefined) {
        fields.push("sensor_data = ?");
        values.push(sensorInformation.data);
      }
      values.push(sensorId);

      await connection.beginTransaction();
      const query = `UPDATE sensors
                    SET ${fields.join(", ")}
                    WHERE sensor_id = ?`;
      const [rows] = await connection.execute(query, values);

      // // If sensor data was updated, also update parking slot status
      if (sensorInformation.data !== undefined) {
        const slotStatus =
          sensorInformation.data < 50 ? "occupied" : "available";

        //   // Get current slot status and check for cooldown
        const currentStatusQuery = `SELECT status FROM parking_slots WHERE sensor_id = ?`;
        const [currentStatusResult] = await connection.execute(
          currentStatusQuery,
          [sensorId]
        );
        const currentStatus = currentStatusResult[0]?.status;
        //   const cooldownUntil = currentStatusResult[0]?.cooldown_until;

        //   // Check if slot is in cooldown period
        //   if (cooldownUntil && new Date() < new Date(cooldownUntil)) {
        //     console.log(
        //       `Sensor ${sensorId}: Slot is in cooldown period, ignoring sensor data`
        //     );
        //     await connection.commit();
        //     return rows;
        //   }

        //   Update parking slot status
        const queryUpdateParkingSlotStatus = `UPDATE parking_slots SET status = ? WHERE sensor_id = ?`;
        await connection.execute(queryUpdateParkingSlotStatus, [
          slotStatus,
          sensorId,
        ]);

        //   // Handle parking activity changes for manual updates
        if (
          slotStatus === "occupied" &&
          (currentStatus === "available" || currentStatus === "held")
        ) {
          await this.handleSlotOccupied(
            connection,
            sensorId,
            sensorInformation.data
          );
        } else if (slotStatus === "available" && currentStatus === "occupied") {
          await this.handleSlotVacated(
            connection,
            sensorId,
            sensorInformation.data
          );
        } else if (slotStatus === "occupied" && currentStatus === "occupied") {
          await this.showCurrentOccupant(
            connection,
            sensorId,
            sensorInformation.data
          );
        } else if (slotStatus === "occupied" && currentStatus === "held") {
          // Slot was held but now occupied - end the held activity
          await this.handleHeldSlotOccupied(
            connection,
            sensorId,
            sensorInformation.data
          );
        }

        await connection.commit();
        return rows;
      }

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

  // New method to handle held slot becoming occupied
  static async handleHeldSlotOccupied(connection, sensorId, sensorData) {
    try {
      // Get the parking slot ID
      const slotQuery = `SELECT slot_id FROM parking_slots WHERE sensor_id = ?`;
      const [slotResult] = await connection.execute(slotQuery, [sensorId]);
      const slotId = slotResult[0].slot_id;

      // Find the active parking activity for this slot (held activity)
      const ParkingActivity = require("./ParkingActivity.model.js");
      const activeActivity =
        await ParkingActivity.getActiveParkingActivityBySlot(slotId);

      if (activeActivity) {
        // End the held parking activity
        await ParkingActivity.endParkingActivity(activeActivity.parking_act_id);

        // Get user info for logging
        const userQuery = `SELECT first_name, last_name FROM users WHERE user_id = ?`;
        const [userResult] = await connection.execute(userQuery, [
          activeActivity.user_id,
        ]);
        const userName =
          userResult.length > 0
            ? `${userResult[0].first_name} ${userResult[0].last_name}`
            : `User ${activeActivity.user_id}`;

        console.log(
          `Sensor ${sensorId}: ${sensorData} -> Slot: occupied (was held) -> User: ${userName} (ID: ${activeActivity.user_id}) - Hold ended`
        );
      } else {
        // No active activity found, create new one
        await this.handleSlotOccupied(connection, sensorId, sensorData);
      }
    } catch (error) {
      console.error("Error handling held slot occupied:", error.message);
      throw error;
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

  static async createParkingActivity(userId, parkingSlotId) {
    const connection = await pool.getConnection();
    const query = `
      INSERT INTO parking_activities (user_id, parking_slot_id, start_time) 
      VALUES (?, ?, NOW())
    `;
    try {
      await connection.beginTransaction();
      const [result] = await connection.execute(query, [userId, parkingSlotId]);
      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      console.log("Error creating parking activity: ", error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async endParkingActivity(parkingActivityId) {
    const connection = await pool.getConnection();
    const query = `
      UPDATE parking_activities 
      SET end_time = NOW() 
      WHERE parking_act_id = ?
    `;
    try {
      await connection.beginTransaction();
      await connection.execute(query, [parkingActivityId]);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      console.log("Error ending parking activity: ", error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Sensor;
