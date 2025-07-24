const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();
const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
