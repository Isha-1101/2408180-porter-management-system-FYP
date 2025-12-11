import { Porters } from "../models/Porters.js";
/**
 *
 * @param {*} req
 * @param {*} res
 * Post: /core-api/porters
 * Description: Create a new porter
 * this endpoint creates a new porter with the provided details.
 * It expects a JSON body with the following fields:
 * - fullName: String (required)
 */
export const createPorter = async (req, res) => {
  try {
    const { fullName, phone, address, porterType } = req.body;

    // Validate required fields
    if (!fullName || !phone || !address || !porterType) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if porterType is valid
    if (!["individual", "team_member"].includes(porterType)) {
      return res.status(400).json({
        message: "porterType must be either 'individual' or 'team_member'.",
      });
    }

    //check existing porter with same phone number
    const existingPorter = await Porters.findOne({
      phone,
    });
    if (existingPorter) {
      return res.status(400).json({
        success: false,
        message: "Porter with this phone number already exists.",
      });
    }

    // Create a new porter instance
    const newPorter = new Porters({
      userId: req.user._id,
      teamId: null,
      fullName,
      phone,
      address,
      porterType,
    });

    // Save the porter to the database
    await newPorter.save();

    res.status(201).json({
      success: true,
      message: "Porter created successfully",
      porter: newPorter,
    });
  } catch (error) {
    console.error("Error creating porter:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the porter.",
    });
  }
};

export const getAllPortersDetails = async (req, res) => {
  try {
    const porters = await porters.find();
    if (!porters) {
      return res
        .status(404)
        .json({ success: false, message: "No porters found" });
    }
    res.status(200).json({
      success: true,
      message: "Porters fetched successfully",
      data: porters,
    });
  } catch (error) {
    console.error("Error fetching porters:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching porters.",
    });
  }
};
