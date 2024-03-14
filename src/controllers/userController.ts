import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModel, { IUser } from "../models/users/schema";
import axios from "axios";

const secretKey = process.env.SECRET_KEY;

/**
 * Controller function for user registration.
 * Registers a new user with the provided details.
 * If successful, returns a JWT token and user data.
 *
 * @param req - Express Request object
 * @param res - Express Response object
 */
export async function register(req: Request, res: Response) {
    const { name, email, password, phoneNumber, gender } = req.body;

    if (name && email && password && phoneNumber && gender) {
        try {
            // Check if a user with the same email already exists
            const existingUser = await UserModel.findOne({ email });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    error: "User with this email already exists",
                });
            }

            // Hash the user's password before saving it in the database
            const hashedPassword = await bcrypt.hash(password, 10);

            const userParams: Partial<IUser> = {
                name,
                email,
                password: hashedPassword,
                phoneNumber,
                gender,
            };

            // Create the user document in the database
            const user = await UserModel.create(userParams);

            // Remove the "password" field from the response before sending it back to the client
            const { password: removedPassword, ...userData } = user.toJSON();

            // Generate JWT token after registration
            const token = jwt.sign({ userId: userData._id }, secretKey, {
                expiresIn: "1d",
            });

            res.status(200).json({
                success: true,
                data: userData,
                token,
                message: "Registration successful",
            });
        } catch (err) {
            res.status(500).json({ success: false, error: "Internal server error" });
        }
    } else {
        res.status(400).json({ success: false, error: "Insufficient parameters" });
    }
}

/**
 * Controller function for user login.
 * Logs in a user with the provided email and password.
 * If successful, returns a JWT token and user data.
 *
 * @param req - Express Request object
 * @param res - Express Response object
 */
export async function login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (email && password) {
        try {
            const user = await UserModel.findOne({ email });

            if (user) {
                // Check if the provided password matches the hashed password in the database
                const isPasswordMatch = await bcrypt.compare(password, user.password);

                if (isPasswordMatch) {
                    // Generate JWT token after successful login
                    const token = jwt.sign({ userId: user._id }, secretKey, {
                        expiresIn: "1d",
                    });

                    // Exclude the password field from the user data to be returned in the response
                    const { password, ...userData } = user.toObject();

                    res.status(200).json({
                        success: true,
                        data: userData,
                        token,
                        message: "Login successful",
                    });
                } else {
                    res.status(401).json({ success: false, error: "Invalid credentials" });
                }
            } else {
                res.status(401).json({ success: false, error: "Invalid credentials" });
            }
        } catch (err) {
            res.status(500).json({ success: false, error: "Internal server error" });
        }
    } else {
        res.status(400).json({ success: false, error: "Insufficient parameters" });
    }
}

/**
 * Define a custom interface that extends the Request interface
 * to add the 'user' property for storing the authenticated user ID.
 */
interface Auth extends Request {
    user?: { id: string };
}

/**
 * Controller function for retrieving the user's profile information.
 * Retrieves the user's profile based on the authenticated user ID.
 *
 * @param req - Express Request object (with added 'user' property)
 * @param res - Express Response object
 */
export const profile = async (req: Auth, res: Response) => {
    const userId = req.user?.id; // Access the user ID from the authenticated request

    try {
        if (!userId) {
            return res.status(401).json({ success: false, error: "User ID not found in the request" });
        }

        // Retrieve the user's profile based on the authenticated user ID
        const userData = await UserModel.findById(userId).select("-password");

        if (!userData) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        // Return the user's profile information
        res.status(200).json({
            success: true,
            data: userData,
            message: "Get user profile successful",
        });
    } catch (err) {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

/**
 * Controller function for fetching a random user from the Random User Generator API.
 * Fetches a random user's details from the third-party API.
 *
 * @param req - Express Request object
 * @param res - Express Response object
 */
export async function getRandomUser(req: Request, res: Response) {
    try {
        const response = await axios.get("https://randomuser.me/api/");

        const randomUser = response.data.results[0];

        res.status(200).json({ success: true, data: randomUser });
    } catch (error) {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
}
