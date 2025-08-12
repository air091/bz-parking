import React from "react";

const Card = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div>
      <header>
        <h1>Entry Form</h1>
      </header>
      <form>
        <div>
          <label htmlFor="name">Name</label>
          <input id="name" type="text" autoComplete="off" />
        </div>
        <div>
          <label htmlFor="firstHr">First 2 hours</label>
          <input id="firstHr" type="checkbox" />
        </div>
        <div>
          <label htmlFor="total">Total Fee</label>
          <span>P20.00</span>
        </div>
        <div>
          <label htmlFor="amount">Amount</label>
          <input id="amount" type="number" autoComplete="off" />
        </div>
        <button onClick={handleSubmit}>Submit</button>
      </form>
    </div>
  );
};

export default Card;
