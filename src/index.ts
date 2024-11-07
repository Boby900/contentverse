// Import necessary modules
// have a look at the drizzle forked repo, was getting an error when uncommenting the libcheck to true or maybe false, fix it atleast open an issue.
import express from 'express';
// import cors from 'cors';
import dotenv from 'dotenv';
import mainRoutes from './routes/main.js';
import userRoutes from './routes/user.js';

dotenv.config({ path: '.env' });

const app = express();

// Enable CORS for cross-origin requests from the React frontend
// app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Parse JSON bodies

// Set up routes
app.use('/', mainRoutes);
app.use('/user', userRoutes);

// Start the servers
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running at ${process.env.PORT}, you better catch it!`);
});
