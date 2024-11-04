// req.body will work in POST request only.
const express = require('express')
const app = express()
const cors = require('cors');
require("dotenv").config({ path: "./config/.env" });
const mainRoutes = require("./routes/main")
const userRoutes = require("./routes/user");

app.use(cors()); // Enable CORS for cross-origin requests from React frontend
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Parse JSON bodies

app.use("/", mainRoutes);
app.use("/user", userRoutes);


//Server Running
app.listen(process.env.PORT, () => {
  console.log(`Server is running at ${process.env.PORT}, you better catch it!`);
});