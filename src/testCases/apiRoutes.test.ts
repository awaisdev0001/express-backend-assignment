import request from "supertest";
import app from "../../src/app/index";

describe("User Routes", () => {
    let loggedinUser;

    const email = "john" + Math.floor(Math.random() * 1000) + "@example.com";

    /**
     * User Registration Test Cases.
     */

    it("Should register a new user with valid credentials", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "John Doe" + Math.floor(Math.random() * 1000),
                email: email,
                password: "password123",
                phoneNumber: "1234567890",
                gender: "male",
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.token).toBeDefined();
    });

    it("Should not register a user with missing required fields", async () => {
        const response = await request(app).post("/api/auth/register").send({
            name: "John Doe",
            email: email,
            // Missing password, phoneNumber, and gender
        });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe("Insufficient parameters");
    });

    it("Should not register a user with an existing email", async () => {
        const response = await request(app).post("/api/auth/register").send({
            name: "Jane Smith",
            email: email, // Same email as before
            password: "password456",
            phoneNumber: "9876543210",
            gender: "female",
        });

        expect(response.status).toBe(409);
        expect(response.body.success).toEqual(false);
        expect(response.body.error).toBe("User with this email already exists");
    });

    /**
     * User Login Test Cases.
     */

    it("Should login with valid credentials and return a JWT token", async () => {
        const loginResponse = await request(app).post("/api/auth/login").send({
            email: email,
            password: "password123",
        });
        loggedinUser = loginResponse;
        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body.success).toEqual(true);
        expect(loginResponse.body.data).toBeDefined();
        expect(loginResponse.body.token).toBeDefined();
    });

    it("Should not login with invalid credentials", async () => {
        const response = await request(app).post("/api/auth/login").send({
            email: email,
            password: "invalidpassword",
        });

        expect(response.status).toBe(401);
        expect(response.body.success).toEqual(false);
        expect(response.body.error).toBe("Invalid credentials");
    });

    /**
     * Fetch Random Users Test Cases.
     */

    it("Should fetch random users with a valid JWT token", async () => {
        const randomUserResponse = await request(app)
            .get("/api/users/random")
            .set("Authorization", `${loggedinUser.body.token}`);

        expect(randomUserResponse.status).toBe(200);
        expect(randomUserResponse.body.success).toEqual(true);
        expect(randomUserResponse.body.data).toBeDefined();
    });

    it("Should reject fetching random users without a JWT token", async () => {
        const response = await request(app).get("/api/users/random");

        expect(response.status).toBe(401);
        expect(response.body.success).toEqual(false);
        expect(response.body.error).toBe("No token provided");
    });
});
