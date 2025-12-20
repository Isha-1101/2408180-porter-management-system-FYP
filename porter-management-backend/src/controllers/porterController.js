import Porters from "../models/Porters.js";
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
