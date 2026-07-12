// AWS Lambda entry point. API Gateway (HTTP API, payload v2) -> serverless-http -> Express.
const serverless = require("serverless-http");
const app = require("./app");
const connectDB = require("./config/db");

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  // Don't wait for the Mongo connection pool to drain before returning.
  context.callbackWaitsForEmptyEventLoop = false;
  await connectDB();
  return handler(event, context);
};
