import express from "express";
import {
  createPorter,
  getAllPortersDetails,
  getPorterByUserId,
  getPorterDetailsById,
  getPorterdocumetsByPorterId,
  getVehicleDetailsByPorterId,
  SavePorterDocuments,
  SaveVehicleDetails,
} from "../controllers/porterController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/roleMiddleware.js";
import upload from "../middlewares/uploadFile.js";

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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - phone
 *               - address
 *               - porterType
 *               - porterPhoto
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Ram Bahadur
 *               phone:
 *                 type: string
 *                 example: "9800000000"
 *               address:
 *                 type: string
 *                 example: Kathmandu, Nepal
 *               porterType:
 *                 type: string
 *                 example: individual
 *               porterPhoto:
 *                 type: string
 *                 format: binary
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
PorterRouter.post(
  "/",
  authenticate,
  authorizeRole("porter"),
  upload.single("porterPhoto"),
  createPorter
);

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
 *         name:
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

//get porter by userId
PorterRouter.get(
  "/by-user",
  authenticate,
  authorizeRole("porter"),
  getPorterByUserId
);
//get porter by id
PorterRouter.get(
  "by-id/:id",
  authenticate,
  authorizeRole("porter"),
  getPorterDetailsById
);

/**
 * @swagger
 * /core-api/porters/vehicle/save/{id}:
 *   post:
 *     summary: Save Vehicle Details of Porter
 *     tags: [Porters]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             vehicleNumber: Bha1cha123
 *             vehicleCategory: "bike"
 *             capacity: 120cc
 *     responses:
 *       200:
 *         description: Vehicle Fetched Successfully
 *       401:
 *         description: Unauthorized
 */
PorterRouter.post(
  "/vehicle/save/:id",
  authenticate,
  authorizeRole("porter"),
  SaveVehicleDetails
);
/**
 * @swagger
 * /core-api/porters/vehicle/get/{id}:
 *   get:
 *     summary: Get Vehicle Details of Porter
 *     tags: [Porters]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vehicle Fetched Successfully
 *       401:
 *         description: Unauthorized
 */
PorterRouter.get(
  "/vehicle/get/:id",
  authenticate,
  authorizeRole("porter"),
  getVehicleDetailsByPorterId
);

/**
 * @swagger
 * /core-api/porters/document/save/{id}:
 *   post:
 *     summary: Save document details of Porter
 *     tags: [Porters]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               porterLicenseNumber:
 *                 type: string
 *               porterLicenseDocument:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Document details saved successfully
 *       401:
 *         description: Unauthorized
 */
PorterRouter.post(
  "/document/save/:id",
  authenticate,
  authorizeRole("porter"),
  upload.single("porterLicenseDocument"),
  SavePorterDocuments
);
/**
 * @swagger
 * /core-api/porters/document/get/{id}:
 *   get:
 *     summary: Get document Details of Porter
 *     tags: [Porters]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: porterId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: porter document fetched successfully
 *       401:
 *         description: Unauthorized
 */
PorterRouter.get(
  "/document/get/:id",
  authenticate,
  authorizeRole("porter"),
  getPorterdocumetsByPorterId
);
export default PorterRouter;
