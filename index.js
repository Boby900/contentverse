const express = require('express')
const app = express()
const cors = require('cors');
const PORT = 3000
const mainRoutes = require("./routes/main")
const userRoutes = require("./routes/user");

app.use(cors()); // Enable CORS for cross-origin requests from React frontend
app.use(express.json()); // Parse JSON bodies

app.use("/", mainRoutes);
app.use("/user", userRoutes);


//Server Running
app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}, you better catch it!`);
});