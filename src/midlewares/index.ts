import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const secretKey = process.env.SECRET_KEY;

/**
 * Define a custom interface that extends the Request interface.
 */
interface Auth extends Request {
    user?: { id: string }; // Add the 'user' property to store the user ID
}

/**
 * Authentication middleware.
 *
 * @param req Auth
 * @param res Response
 * @param next NextFunction
 * @returns mixed Response
 */
export const authenticationMiddleware = (req: Auth, res: Response, next: NextFunction) => {
    // Get the token from the "Authorization" header
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ success: false, error: "No token provided" });
    }

    try {
        // Verify the token and extract the user ID
        const decodedToken = jwt.verify(token, secretKey) as { userId: string };

        req.user = { id: decodedToken.userId }; // Create a user object with the user ID and attach it to the request object
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: "Invalid token" });
    }
};

/**
 * Logs requests.
 *
 * @param req  Request object
 * @param res Response object
 * @param next Next callback
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const { method, url } = req;

    const timestamp = new Date().toISOString();

    console.log(`${timestamp} - ${method} - ${url}`);

    next();
};
