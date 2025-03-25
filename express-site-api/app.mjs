import express from 'express';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import fileupload from 'express-fileupload';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import logger from './app/Helper/logger.mjs';
import morgan from 'morgan';
import { adminRouter } from './routes/admin.mjs';
import { apiRouter } from './routes/api.mjs';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.mjs';
import { queryLogger } from './app/Helper/queryLogger.mjs';
import { accessLogger } from './app/Helper/logger.mjs'; // Import accessLogger
import { deleteCacheFiles } from "./app/Helper/util.mjs";


dotenv.config();
const PORT = process.env.PORT || 3000;

// Create an Express application
const app = express();
app.locals.cache_driver = process.env.CACHE_DRIVER;


// Convert the module URL to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up middleware
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Set up CORS options
const corsOptions = {
  origin: [process.env.FRONTEND_URL, process.env.ADMIN_URL], // Replace with your Next.js app's URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Include cookies and headers with credentials
};
app.use(cors(corsOptions));

// Set up static file serving for the /public/admin directory
app.use('/files', express.static(path.join(__dirname, 'public', 'files')));
app.use(express.static(path.join(__dirname, 'public')));

// Set up file upload middleware
app.use(fileupload());

if (process.env.APP_DEBUG === 'true') {
  // Set up Query logging middleware
  app.use(queryLogger);
}

// Set up Swagger documentation
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Find-and-Glow",
      version: "1.0.0",
    },
    servers: [{
      url: process.env.BASE_URL,
    }],
  },
  apis: ["./routes/*.js"],
};
const swaggerSpec = swaggerJSDoc(options);
const swaggerConfig = JSON.parse(await fs.promises.readFile(new URL('./swagger.json', import.meta.url)));
const swaggerDocument = JSON.parse(await fs.promises.readFile(new URL('./swagger.json', import.meta.url)));
app.use(
  "/api-docs",
  function (req, res, next) {
    swaggerConfig.host = req.get("host");
    req.swaggerDoc = swaggerConfig;
    next();
  },
  swaggerUi.serveFiles(swaggerConfig, options),
  swaggerUi.setup(swaggerDocument)
);
//set interval for delete cache files
setInterval(deleteCacheFiles, 10 * 60 * 1000);

// Connect to MongoDB
mongoose.set('strictQuery', false);

if (process.env.APP_DEBUG === 'true') {
  // Use Morgan to log all requests to the Winston logger
  app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms ":referrer" ":user-agent"', {
    stream: {
      write: (message) => accessLogger.info(message.trim()) // Log to accessLogger
    }
  }));
}

// Set up routes
app.use('/admin', adminRouter);
app.use('/api', apiRouter);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  // Restart the server after a delay
  setTimeout(() => {
    server.close(() => {
      console.log('Server closed due to uncaught exception. Restarting...');
      startServer();
    });
  }, 1000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  setTimeout(() => {
    server.close(() => {
      console.log('Server closed due to unhandled rejection. Restarting...');
      startServer();
    });
  }, 1000);
});

// Function to start the server
function startServer() {
  app.listen(PORT, () => {
    connectDB();
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
// Start the server initially
startServer();
