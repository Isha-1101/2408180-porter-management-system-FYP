import DocumentInformation from "../models/DocumentInformation.js";
import Porters from "../models/Porters.js";
import VehicleTypes from "../models/vehicleTypes.js";
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
    const { fullName, phone, address, porterType, porterPhoto } = req.body;

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
      userId: req.user.id,
      teamId: null,
      fullName,
      phone,
      address,
      porterType,
      porterPhoto: porterPhoto || null,
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
  const { page, limit, teamId, porterType, searchText } = req.query;
  console.log("Query Params:", req.query);
  try {
    const porters = await Porters.find({
      teamId: teamId || { $exists: true },
      porterType: porterType || { $exists: true },
      fullName: searchText
        ? { $regex: searchText, $options: "i" }
        : { $exists: true },
    })
      .skip((page - 1) * limit)
      .limit(limit);
    if (!porters) {
      return res
        .status(404)
        .json({ success: false, message: "No porters found" });
    }
    if (porters.length === 0) {
      return res
        .status(204)
        .json({ success: true, message: "No porters found" });
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

export const updatePorterDetails = async (req, res) => {
  // admin only
  const porterId = req.params.id;
  const updateData = req.body; //{ fullName, phone, address, porterType }
  try {
    const updatedPorter = await Porters.findByIdAndUpdate(
      porterId,
      updateData,
      { new: true }
    );
    if (!updatedPorter) {
      return res
        .status(404)
        .json({ success: false, message: "Porter not found" });
    }
    res.status(200).json({
      message: "Porter updated successfully",
      success: true,
      porter: updatedPorter,
    });
  } catch (error) {
    console.error("Error updating porter:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the porter.",
    });
  }
};
export const deletePorterAccounts = async (req, res) => {
  // porter itself or admin can delete
  const porterId = req.params.id;
  const { isDeleted } = req.body;
  try {
    const deletedPorter = await Porters.findByIdAndUpdate(
      porterId,
      { isDeleted: isDeleted || true },
      { new: true }
    );
    if (!deletedPorter) {
      return res
        .status(404)
        .json({ success: false, message: "No account found" });
    }
    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting porter:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the account.",
    });
  }
};

export const bannedPorter = async (req, res) => {
  // admin only
  const porterId = req.params.id;
  const { porterStatus, remarks } = req.body;
  try {
    const bannedPorter = await Porters.findByIdAndUpdate(
      porterId,
      { isBanned: porterStatus, remarks },
      { new: true }
    );
    if (!bannedPorter) {
      return res
        .status(404)
        .json({ success: false, message: "Porter not found" });
    }
    res.status(200).json({
      message: "Porter banned successfully",
      success: true,
      porter: bannedPorter,
    });
  } catch (error) {
    console.error("Error banning porter:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while banning the porter.",
    });
  }
};

export const unBannedPorter = async (req, res) => {
  // admin only
  const porterId = req.params.id;
  try {
    const unBannedPorter = await Porters.findByIdAndUpdate(
      porterId,
      { isBanned: false },
      { new: true }
    );
    if (!unBannedPorter) {
      return res
        .status(404)
        .json({ success: false, message: "Porter not found" });
    }
    res.status(200).json({
      message: "Porter unbanned successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error unbanning porter:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while unbanning the porter.",
    });
  }
};

export const getPorterAccountsById = async (req, res) => {
  const porterId = req.params.id;
  try {
    const porter = await Porters.findById(porterId);
    if (!porter) {
      return res

        .status(404)
        .json({ success: false, message: "Porter not found" });
    }
    res.status(200).json({
      success: true,
      message: "Porter fetched successfully",
      porter,
    });
  } catch (error) {
    console.error("Error fetching porter:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the porter.",
    });
  }
};

// save vehicle details

export const SaveVehicleDetails = async (req, res) => {
  try {
    const { vehicleNumber, vehicleCategory, capacity } = req.body;
    const porterId = req.params.id;
    const userId = req.user.id;
    const porter = Porters.findById(porterId);
    if (!porter) {
      return res
        .status(404)
        .json({ success: false, message: "porter not found" });
    }

    const vehicle = new VehicleTypes({
      vehicleNumber,
      vehicleCategory,
      capacity,
      porterId,
      userId,
    });
    const savedVehicle = await vehicle.save();
    res.status(200).json({
      success: true,
      message: "Vehicle details saved successfully",
      vehicle: {
        vehicleNumber: savedVehicle.vehicleNumber,
        vehicleCategory: savedVehicle.vehicleCategory,
        capacity: savedVehicle.capacity,
      },
    });
  } catch (error) {
    console.error("Error saving vehicle details:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while saving the vehicle details.",
    });
  }
};

export const getVehicleDetailsByPorterId = async (req, res) => {
  try {
    const porterId = req.params.id;
    const porter = await Porters.findById(porterId);
    if (!porter) {
      return res
        .status(404)
        .json({ success: false, message: "porter not found" });
    }
    const vehicleDetails = await VehicleTypes.find({ porterId }).select(
      "-__v -createdAt -updatedAt -_id -userId -porterId"
    );
    res.status(200).json({
      success: true,
      message: "Vehicle details fetched successfully",
      vehicleDetails,
    });
  } catch (error) {
    console.error("Error fetching vehicle details:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the vehicle details.",
    });
  }
};
export const SavePorterDocuments = async (req, res) => {
  try {
    const { porterLincenseNumber, porterLicenseDocument } = req.body;
    console.log({ porterLincenseNumber, porterLicenseDocument });
    const porterId = req.params.id;
    const porter = Porters.findById(porterId);
    if (!porter) {
      return res
        .status(404)
        .json({ success: false, message: "porter not found" });
    }

    const porterDocument = new DocumentInformation({
      porterLincenseNumber,
      porterLicenseDocument,
      porterId,
      userId: req.user.id,
    });
    const savedPorterDocument = await porterDocument.save();
    res.status(200).json({
      success: true,
      message: "porter document saved successfully",
      document: {
        porterLincenseNumber: savedPorterDocument.porterLincenseNumber,
        porterLicenseDocument: savedPorterDocument.porterLicenseDocument,
      },
    });
  } catch (error) {
    console.error("Error saving porter document:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while saving the porter document.",
    });
  }
};

export const getPorterdocumetsByPorterId = async (req, res) => {
  try {
    const porterId = req.params.id;
    const porter = await Porters.findById(porterId);
    if (!porter) {
      return res
        .status(404)
        .json({ success: false, message: "porter not found" });
    }
    const porterDocuments = await DocumentInformation.find({ porterId }).select(
      "-__v -createdAt -updatedAt -_id -userId -porterId"
    );
    res.status(200).json({
      success: true,
      message: "porter documents fetched successfully",
      porterDocuments,
    });
  } catch (error) {
    console.error("Error fetching porter documents:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the porter documents.",
    });
  }
};
