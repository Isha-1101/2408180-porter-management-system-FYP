import PorterTeam from "../../../models/porter/porterTeam.js";
import Porters from "../../../models/porter/Porters.js";
import User from "../../../models/User.js";

export const browseAvailableTeams = async (req, res) => {
  try {
    const { portersRequired } = req.query;

    const query = { isActive: true };

    if (portersRequired) {
      query.noOfMember = { $gte: parseInt(portersRequired) };
    }

    const teams = await PorterTeam.find(query)
      .populate("ownerId", "name email phone")
      .select("-__v");

    const teamsWithDetails = await Promise.all(
      teams.map(async (team) => {
        const members = await Porters.find({
          teamId: team._id,
          role: "worker",
          status: { $in: ["active", "approved"] },
          isVerified: true,
        }).countDocuments();

        const owner = await Porters.findOne({
          teamId: team._id,
          role: "owner",
        }).populate("userId", "name");

        return {
          _id: team._id,
          teamName: `Team ${owner?.userId?.name || "Unknown"}`,
          ownerName: owner?.userId?.name,
          totalMembers: team.noOfMember,
          availableMembers: members,
          totalCompletedJobs: team.totalCompletedJobs || 0,
          isActive: team.isActive,
          createdAt: team.createdAt,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      data: teamsWithDetails,
    });
  } catch (error) {
    console.error("Error browsing teams:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to browse teams",
      error: error.message,
    });
  }
};
