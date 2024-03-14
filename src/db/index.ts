import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

/**
 * Create database connection.
 */
export const connectToDatabase = async () => {
    try {
        await mongoose.connect(MONGODB_URI);

        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
    }
};

/**
 * Destroy database connection.
 */
export const disconnectFromDatabase = async () => {
    try {
        await mongoose.disconnect();

        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error("Error disconnecting from MongoDB:", error.message);
    }
};
