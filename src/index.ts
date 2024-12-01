// Import necessary modules
import express from 'express';
// import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mainRoutes from './routes/main.js';
import authRoutes from './routes/auth.js';
import contentRoutes from './routes/content.js';
dotenv.config({ path: '.env' });

const app = express();

// Enable CORS for cross-origin requests from the React frontend
// app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Parse JSON bodies

// Set up routes
app.use('/api', mainRoutes);
app.use('/api/auth', authRoutes)
app.use('/api/content', contentRoutes)
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this to your frontend's origin later
    methods: ["GET", "POST"],
  },
});

// Listen for Socket.IO connections
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Listen for custom events
  socket.on('message', (data) => {
    console.log(`Received message: ${data}`);
    // Broadcast the message to all connected clients
    io.emit('message', `Echo: ${data}`);
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
})


// Start the servers
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running at ${PORT}, you better catch it!`);
});
export default app