import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/cloudsphere';

// Configure Mongoose options if needed
mongoose.set('strictQuery', true);

// Start the Express server function
const startServer = () => {
  const server = app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`Health check endpoint: http://localhost:${PORT}/api/health`);
  });

  // Graceful Shutdown
  const gracefulShutdown = (signal) => {
    console.log(`Received ${signal}. Starting graceful shutdown...`);
    server.close(() => {
      console.log('Express HTTP server closed.');
      if (mongoose.connection.readyState !== 0) {
        mongoose.connection.close(false)
          .then(() => {
            console.log('MongoDB connection closed.');
            process.exit(0);
          })
          .catch((err) => {
            console.error('Error during MongoDB connection close:', err);
            process.exit(1);
          });
      } else {
        console.log('No active MongoDB connection to close.');
        process.exit(0);
      }
    });

    // Force close server after 10s if graceful shutdown hangs
    setTimeout(() => {
      console.error('Forced shutdown due to timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
};

// Connect to MongoDB and start server only after successful connection
console.log('Connecting to MongoDB...');
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000
})
  .then(() => {
    console.log('MongoDB connection established successfully.');
    startServer();
  })
  .catch((error) => {
    console.error('⚠️ Failed to connect to MongoDB on startup:', error.message);
    console.error('Please verify your MONGO_URI and network access. Exiting.');
    process.exit(1);
  });
