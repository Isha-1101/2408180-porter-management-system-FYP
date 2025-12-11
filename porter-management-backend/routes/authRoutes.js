import express from "express";
import { register, login } from "../controllers/authController.js";

const authRouter = express.Router();

/**
 * @swagger
 * /core-api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with the provided details.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
authRouter.post("/register", register);

/**
 * @swagger
 * /core-api/auth/login:
 *   post:
 *     summary: Login a user
 *     description: Login a user with phone and password.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *               password:
 *                 type: string
 *                 description: User's password
 *             required:
 *               - phone
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid Credentials
 */
authRouter.post("/login", login);

export default authRouter;
