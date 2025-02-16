
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import mainRoutes from "./routes/main.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import cookieParser from "cookie-parser";
import collectionRoutes from "./routes/collection.js";

import { limiter } from "./lib/express-rate-liimiter.js";
dotenv.config({ path: ".env" });

const app = express();

const allowedOrigin =
  process.env.NODE_ENV === "production"
    ? "https://clientverse.vercel.app"
    : "http://localhost:5173";



const corsOptions = {
  origin: allowedOrigin, // Allow requests from this origin
  methods: ["GET", "POST", "PUT", "DELETE"], // Define allowed HTTP methods
  credentials: true, // Allow cookies if needed
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser());
app.use(cors(corsOptions));
// Set up routes
app.use("/api", mainRoutes);
app.use("/api/auth", limiter, authRoutes);
app.use("/api/collection", collectionRoutes);
app.use("/api/user", userRoutes);
const server = createServer(app);

const io = new Server(server, {
  cors: corsOptions,
});

// Listen for Socket.IO connections
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Listen for custom events
  socket.on("message", (data) => {
    console.log(`Received message: ${data}`);
    // Broadcast the message to all connected clients
    io.emit("message", `Echo: ${data}`);
  });

  // Handle client disconnection
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start the servers
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running at ${PORT}, you better catch it!`);
});
export default app;
