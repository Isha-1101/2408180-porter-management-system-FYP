import express from "express";
import {
  createPorter,
  getAllPortersDetails,
} from "../controllers/porterController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/roleMiddleware.js";

const PorterRouter = express.Router();
/**
 * @swagger
 * /core-api/porters:
 *   post:
 *     summary: Create a new porter
 *     tags: [Porters]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             fullName: Ram Bahadur
 *             phone: "9800000000"
 *             address: Kathmandu, Nepal
 *             porterType: individual
 *             porterPhoto: "photo.jpg"
 *     responses:
 *       201:
 *         description: Porter created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Porter with this phone already exists
 */
PorterRouter.post("/", authenticate, authorizeRole("porter"), createPorter);

/**
 * @swagger
 * /core-api/porters:
 *   get:
 *     summary: Get all porters
 *     tags: [Porters]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: searchText
 *         schema:
 *           type: string
 *           example: "Ram"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: teamId
 *         schema:
 *           type: string
 *           example: "team123"
 *       - in: query
 *         name: porterType
 *         schema:
 *           type: string
 *           example: "individual"
 *     responses:
 *       200:
 *         description: List of porters
 *       401:
 *         description: Unauthorized
 */
PorterRouter.get("/", authenticate, getAllPortersDetails);

export default PorterRouter;
