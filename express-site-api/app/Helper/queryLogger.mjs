import mongoose from 'mongoose';
import { queryLogger as logger } from './logger.mjs';

let isExecIntercepted = false;

// Middleware function to log MongoDB query execution time
export const queryLogger = (req, res, next) => {
  if (!isExecIntercepted) {
    interceptExec();
    isExecIntercepted = true;
  }

  // Reset the query counter for each new request
  req.queryCount = 0;
  req.queryInfo = []; // Initialize an array to store query information

  // Function to increment query count
  req.incrementQueryCount = () => {
    req.queryCount++;
  };

  // Attach the request object and route information to mongoose query options
  mongoose.Query.prototype.setOptions = function (options) {
    this.options = { ...this.options, ...options, req, route: req.originalUrl };
    return this;
  };

  // Log the queries when the response is sent
  res.on('finish', () => {
    logQueries(req);
  });

  next();
};

function interceptExec() {
  const originalExec = mongoose.Query.prototype.exec;

  mongoose.Query.prototype.exec = function () {
    const startTime = Date.now(); // Start measuring time before the route handler
    const query = this.getQuery();
    const collection = this.mongooseCollection.name;
    const operation = this.op;

    const result = originalExec.apply(this, arguments);

    result.then(() => {
      const duration = Date.now() - startTime; // Calculate query execution time

      // Ensure req.incrementQueryCount is a function before calling it
      if (this.options.req && typeof this.options.req.incrementQueryCount === 'function') {
        this.options.req.incrementQueryCount();
      }

      const route = this.options.route || 'unknown route';

      // Store the query information in the array
      this.options.req.queryInfo.push({
        collection,
        query,
        operation,
        route,
        duration,
      });
    }).catch((error) => {
      logger.error(`MongoDB Query Error - Collection: ${collection}, Query: ${JSON.stringify(query)}, Operation: ${operation}, Error: ${error}`);
    });

    return result;
  };
}

// Function to log the queries
function logQueries(req) {
  if (req.queryInfo.length === 0) return; // Return if queryInfo array is empty

  const totalDuration = req.queryInfo.reduce((sum, info) => sum + info.duration, 0);

  logger.info(`Route: ${req.originalUrl}, Duration: ${totalDuration}ms, Query Count: ${req.queryCount}, Operation: {
${req.queryInfo.map(info => `MongoDB Query - Collection: ${info.collection}, Query: ${JSON.stringify(info.query)}, Operation: ${info.operation}, Route: ${info.route}, Duration: ${info.duration}ms`).join('\n')}
}`);
}

// Middleware function to retrieve the number of queries executed
export const getQueryCount = (req) => {
  return req.queryCount;
};