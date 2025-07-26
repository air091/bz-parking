const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/User.routes.js");
require("dotenv").config();

const app = express();
const port = process.env.AUTH_PORT;

app.use(express.json());
app.use(cors());
app.use("/api/user", userRoutes);

app.listen(port, () => {
  console.log(`Auth server is running on port: ${port}`);
});
