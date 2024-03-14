import { Router } from "express";
import { register, login, profile, getRandomUser } from "../controllers/userController";
import { authenticationMiddleware } from "../midlewares"; // Import the auth middleware

const router = Router();

/**
 * Public Routes: These routes are accessible to any user without authentication.
 */

// Route for user registration
router.post("/auth/register", register);

// Route for user login
router.post("/auth/login", login);

/**
 * Protected Routes: These routes require authentication using the 'auth' middleware.
 */

// Route to fetch the user's profile information based on the authenticated user ID
router.route("/auth/profile").get(authenticationMiddleware, profile);

// Route to fetch a random user from the Random User Generator API
router.route("/users/random").get(authenticationMiddleware, getRandomUser);

export default router;
