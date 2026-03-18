import mongoose from "mongoose";
import Porters from "../models/porter/Porters.js";

export const getAllPortersDetails = async (req, res) => {
  const { page, limit, teamId, porterType, searchText } = req.query;
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

export const getPorterDetailsByUserId = async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);

  try {
    const pipeline = [
      {
        $match: { userId },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "porterbasicinfos",
          localField: "registrationId",
          foreignField: "registrationId",
          as: "porterBasicInfo",
        },
      },
      {
        $unwind: {
          path: "$porterBasicInfo",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "portervehicles",
          localField: "registrationId",
          foreignField: "registrationId",
          as: "vehicle",
        },
      },
      {
        $unwind: {
          path: "$vehicle",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "porterdocuments",
          localField: "registrationId",
          foreignField: "registrationId",
          as: "document",
        },
      },
      {
        $unwind: {
          path: "$document",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    const porter = await Porters.aggregate(pipeline);

    if (!porter || porter.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Porter not found",
      });
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

export const getPorterDetailsById = async (req, res) => {
  const porterId = req.params.id;
  try {
    const porter = await Porters.findById(porterId).select(
      "-createdAt -updatedAt -userId -teamId -__v",
    );
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

export const getPorterByUserId = async (req, res) => {
  const userId = req.user.id;
  try {
    const porter = await Porters.findOne({ userId }).select(
      "-createdAt -updatedAt -userId -teamId -__v",
    );
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

export const updatePorterDetails = async (req, res) => {
  // admin only
  const porterId = req.params.id;
  const updateData = req.body; //{ fullName, phone, address, porterType }
  try {
    const updatedPorter = await Porters.findByIdAndUpdate(
      porterId,
      updateData,
      { new: true },
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
      { new: true },
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
      { new: true },
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
      { new: true },
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

export const togglePorterStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const porter = await Porters.findOne({ userId });

    if (!porter) {
      return res
        .status(404)
        .json({ success: false, message: "Porter not found." });
    }

    // Toggle currentStatus between online and offline
    const newStatus = porter.currentStatus === "online" ? "offline" : "online";
    porter.currentStatus = newStatus;
    await porter.save();

    res.status(200).json({
      success: true,
      message: `Porter status updated to ${newStatus}`,
      currentStatus: newStatus,
    });
  } catch (error) {
    console.error("Error toggling porter status:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the porter status.",
    });
  }
};
