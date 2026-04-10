import PorterTeam from "../../../models/porter/porterTeam.js";

export const browseAvailableTeams = async (req, res) => {
  try {
    const { portersRequired } = req.query;

    const query = {
      isActive: true,
    };

    if (portersRequired) {
      query.noOfMember = { $gte: parseInt(portersRequired, 10) };
    }

    const teams = await PorterTeam.find(query)
      .populate("ownerId", "name email phone")
      .select("ownerId noOfMember noOfAvailableMember isActive createdAt")
      .sort({ createdAt: -1 })
      .limit(20);

    const formattedTeams = teams.map((team) => ({
      _id: team._id,
      teamName: `Team of ${team.ownerId?.name || "Unknown"}`,
      ownerName: team.ownerId?.name,
      ownerPhone: team.ownerId?.phone,
      noOfMember: team.noOfMember,
      noOfAvailableMember: team.noOfAvailableMember || 0,
      createdAt: team.createdAt,
    }));

    return res.status(200).json({
      success: true,
      data: formattedTeams,
    });
  } catch (error) {
    console.error("Error browsing available teams:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to browse teams",
      error: error.message,
    });
  }
};
