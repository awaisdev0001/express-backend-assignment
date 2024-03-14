import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import userRoutes from "../routes";
import { connectToDatabase } from "../db";
import { requestLogger } from "../midlewares";

const app: express.Application = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/**
 * Add CORS middleware
 */
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    next();
});

/**
 * Connect to MongoDB
 */
connectToDatabase();

/**
 * Apply the logging middleware to log incoming requests
 */
app.use(requestLogger);

/**
 * Add user routes to the app
 */
app.use("/api", userRoutes);

export default app;
