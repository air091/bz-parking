import React, { useState, useEffect } from "react";

const Card = () => {
  const [entryForm, setEntryForm] = useState({
    name: "",
    plateNumber: "",
    arrivalTime: "",
    departureTime: "",
    first2Hours: 0,
    succeedingHours: 0,
    totalFee: 20,
    amount: 0,
  });

  // Add this useEffect for debugging
  useEffect(() => {
    console.log("Form state updated:", entryForm);
  }, [entryForm]);

  const calculateFees = (arrival, departure) => {
    if (!arrival || !departure)
      return { first2Hours: 0, succeedingHours: 0, amount: 0 };
    const start = new Date(arrival);
    const end = new Date(departure);
    const diffMs = end - start;
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || diffMs <= 0) {
      return { first2Hours: 0, succeedingHours: 0, amount: 0 };
    }

    // For demo: treat every minute as an hour
    const totalHours = Math.ceil(diffMs / (1000 * 60)); // Convert milliseconds to minutes (hours for demo)

    let first2Hours = 0;
    let succeedingHours = 0;

    if (totalHours === 1) {
      first2Hours = 30; // First hour: PHP 30
    } else if (totalHours === 2) {
      first2Hours = 70; // First 2 hours: PHP 30 + PHP 40 = PHP 70
    } else if (totalHours > 2) {
      first2Hours = 70; // First 2 hours: PHP 30 + PHP 40 = PHP 70
      succeedingHours = (totalHours - 2) * 30; // Additional hours: PHP 30 each
    }

    const amount = first2Hours + succeedingHours;

    return { first2Hours, succeedingHours, amount };
  };

  const handleArrivalChange = (e) => {
    const arrival = e.target.value;
    // Clear departure time when arrival changes
    setEntryForm((prev) => ({
      ...prev,
      arrivalTime: arrival,
      departureTime: "",
      first2Hours: 0,
      succeedingHours: 0,
      amount: 0,
    }));
  };

  const handleDepartureChange = (e) => {
    if (!entryForm.arrivalTime) return;
    const departure = e.target.value;
    console.log("Departure changed to:", departure);

    const { first2Hours, succeedingHours, amount } = calculateFees(
      entryForm.arrivalTime,
      departure
    );

    console.log("Calculated fees:", { first2Hours, succeedingHours, amount });

    setEntryForm((prev) => ({
      ...prev,
      departureTime: departure,
      first2Hours,
      succeedingHours,
      amount,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(entryForm.name);
    console.log(entryForm.first2Hours);
    console.log(entryForm.totalFee);
    console.log(entryForm.amount);
  };

  return (
    <div>
      <header>
        <h1>Entry Form</h1>
      </header>
      <form>
        <div>
          <label htmlFor="firstHr">First 2 Hours</label>
          <input
            id="firstHr"
            type="number"
            value={entryForm.first2Hours}
            readOnly
          />
        </div>
        <div>
          <label htmlFor="succeedingHrs">Succeeding Hours</label>
          <input
            id="succeedingHrs"
            type="number"
            value={entryForm.succeedingHours}
            readOnly
          />
        </div>
        <div>
          <label htmlFor="amount">TOTAL AMOUNT DUE:</label>
          <input
            id="amount"
            type="number"
            autoComplete="off"
            value={entryForm.amount}
            readOnly
          />
        </div>

        <div>
          <div>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              autoComplete="off"
              value={entryForm.name}
              onChange={(e) =>
                setEntryForm((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
          <div>
            <label htmlFor="plateNum">Plate Number</label>
            <input
              id="plateNum"
              type="text"
              autoComplete="off"
              value={entryForm.plateNumber}
              onChange={(e) =>
                setEntryForm((prev) => ({
                  ...prev,
                  plateNumber: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <label htmlFor="arrivalTime">Arrival Time</label>
            <input
              id="arrivalTime"
              type="datetime-local"
              autoComplete="off"
              value={entryForm.arrivalTime}
              onChange={handleArrivalChange}
            />
          </div>
          <div>
            <label htmlFor="departureTime">Departure Time</label>
            <input
              id="departureTime"
              type="datetime-local"
              autoComplete="off"
              value={entryForm.departureTime}
              onChange={handleDepartureChange}
              disabled={!entryForm.arrivalTime}
              min={entryForm.arrivalTime || undefined}
            />
          </div>
        </div>

        <button onClick={handleSubmit}>Submit</button>
      </form>
    </div>
  );
};

export default Card;
