import express from "express"
import { loginValidator, registrationValidator } from "../validators/auth-validator.js"
import { registrationHandler } from "../controllers/register-controller.js"
import { verifyEmailHandler } from "../controllers/register-controller.js";
import { loginHandler } from "../controllers/login-controller.js";
import { resendVerificationEmailHandler } from "../controllers/register-controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { logoutUser } from "../controllers/logout-controller.js";

const router = express.Router()


/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User registration and login
 */


/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account and sends a verification email.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User registered successfully. Verification email sent.
 *       400:
 *         description: Validation error / User already exists.
 *       500:
 *         description: Server error.
 */
router.post('/register', registrationValidator, registrationHandler);

/**
 * @swagger
 * /verify-email:
 *   get:
 *     summary: Verify user email
 *     description: Verifies a user's email using a token (sent via email).
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token.
 *     responses:
 *       200:
 *         description: Email verified successfully.
 *       400:
 *         description: Invalid or expired token.
 *       500:
 *         description: Server error.
 */
router.get("/verify-email", verifyEmailHandler);

/**
 * @swagger
 * /resend-verification:
 *   post:
 *     summary: Resend verification email
 *     description: Resends a verification email to the user.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Verification email resent successfully.
 *       400:
 *         description: Invalid email / User already verified.
 *       500:
 *         description: Server error.
 */
router.post("/resend-verification", resendVerificationEmailHandler);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in a user
 *     description: Logs in a user and returns a JWT token.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: User logged in successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token.
 *       400:
 *         description: Invalid credentials.
 *       500:
 *         description: Server error.
 */
router.post('/login', loginValidator, loginHandler);

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Log out a user
 *     description: Logs out a user by invalidating their JWT token.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully.
 *       401:
 *         description: Unauthorized / Invalid token.
 *       500:
 *         description: Server error.
 */
router.post('/logout', authMiddleware, logoutUser);


export default router