import express from "express";
import { banneduser, deleteUserAccounts, getAllUsersDetails, getUserById, login, register } from "../controllers/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/roleMiddleware.js";

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

/**
 * @swagger
 * /core-api/auth/delete-user/{id}:
 *  put:
 *    summary: Delete a user account
 *    tags:
 *      - Users
 *    security:
 *     - BearerAuth: []
 *    parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              isDeleted:
 *                type: boolean
 *    responses:
 *      200:
 *        description: User account deleted successfully
 */
authRouter.put(
  "/delete-user/:id",
  authenticate,
  deleteUserAccounts
);

/**
 * @swagger
 * /core-api/auth/banned-user/{id}:
 *   put:
 *     summary: Ban or unban a user account
 *     tags: [Admin]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userStatus:
 *                 type: boolean
 *                 example: true
 *               remarks:
 *                 type: string
 *                 example: Violation of terms and conditions
 *     responses:
 *       200:
 *         description: User account updated successfully
 *       400:
 *         description: User not found
 */

authRouter.put(
  "/banned-user/:id",
  authenticate,
  authorizeRole("admin"),
  banneduser
);

/**
 * @swagger
 * /core-api/auth/get-users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: searchText
 *         schema:
 *           type: string
 *           example: ""
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           example: ""
 *       - in: query
 *         name: isBanned
 *         schema:
 *           type: boolean
 *           example: false
 *       - in: query
 *         name: isDeleted
 *         schema:
 *           type: boolean
 *           example: false
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 */
authRouter.get(
  "/get-users",
  authenticate,
  authorizeRole("admin"),
  getAllUsersDetails
);
/**
 * @swagger
 * /core-api/auth/get-users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User fetched successfully
 *       400:
 *         description: User not found
 */
authRouter.get("/get-users", authenticate, getUserById);

export default authRouter;
