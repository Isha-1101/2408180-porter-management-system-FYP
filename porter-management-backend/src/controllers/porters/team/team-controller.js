import Porters from "../../../models/porter/Porters.js";
import PorterTeam from "../../../models/porter/porterTeam.js";
import PorterBooking from "../../../models/PorterBooking.js";
import porterBasicInfo from "../../../models/porter/porter-basic-info.js";
import PorterDocument from "../../../models/porter/porter-document-info.js";
import PorterVehicle from "../../../models/porter/porter-vehicle-info.js";

export const getPorterByTeamId = async (req, res) => {
  try {
    const { teamId } = req.params;
    if (!teamId) {
      return res.status(400).json({ message: "teamId parameter is required" });
    }

    const porters = await Porters.find({ teamId })
      .populate("userId", "name email phone")
      .select("-__v -location -createdAt -updatedAt");

    if (!porters.length) {
      return res
        .status(404)
        .json({ message: "No porters found for the given team ID" });
    }

    const porterDetails = await Promise.all(
      porters.map(async (porter) => {
        const [basicInfo, vehicle, documents] = await Promise.all([
          porterBasicInfo.findOne({ registrationId: porter.registrationId }),
          PorterVehicle.findOne({ registrationId: porter.registrationId }),
          PorterDocument.findOne({ registrationId: porter.registrationId }),
        ]);
        return { porter, basicInfo, vehicle, documents };
      }),
    );

    res.status(200).json({ success: true, porters: porterDetails });
  } catch (error) {
    console.error("Error fetching porters by team ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTeamDashboard = async (req, res) => {
  try {
    const ownerPorter = await Porters.findOne({
      userId: req.user.id,
      role: "owner",
    });

    if (!ownerPorter) {
      return res.status(404).json({
        success: false,
        message: "Team owner not found",
      });
    }

    const team = await PorterTeam.findById(ownerPorter.teamId)
      .populate("ownerId", "name email phone");

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    const members = await Porters.find({ teamId: team._id })
      .populate("userId", "name email phone")
      .select("-location -__v");

    const memberDetails = members.map((m) => {
      const teamMember = team.members?.find(
        (tm) => tm.porterId?.toString() === m._id.toString(),
      );
      return {
        _id: m._id,
        name: m.userId?.name,
        email: m.userId?.email,
        phone: m.userId?.phone,
        role: m.role,
        status: m.status,
        currentStatus: m.currentStatus,
        joinedAt: teamMember?.joinedAt || m.createdAt,
        isActive: teamMember?.isActive ?? true,
      };
    });

    const pendingBookings = await PorterBooking.countDocuments({
      assignedTeamId: team._id,
      status: { $in: ["PENDING_TEAM_REVIEW", "PENDING_MEMBER_RESPONSE", "AWAITING_OWNER_CONFIRMATION"] },
    });

    const activeJobs = await PorterBooking.countDocuments({
      assignedTeamId: team._id,
      status: { $in: ["CONFIRMED", "IN_PROGRESS"] },
    });

    const completedJobs = await PorterBooking.countDocuments({
      assignedTeamId: team._id,
      status: "COMPLETED",
    });

    return res.status(200).json({
      success: true,
      data: {
        team: {
          _id: team._id,
          isActive: team.isActive,
          totalMembers: memberDetails.length,
          createdAt: team.createdAt,
        },
        members: memberDetails,
        stats: {
          totalMembers: memberDetails.length,
          activeJobs,
          completedJobs,
          pendingBookings,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching team dashboard:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch team dashboard",
      error: error.message,
    });
  }
};

export const getTeamBookingHistory = async (req, res) => {
  try {
    const ownerPorter = await Porters.findOne({
      userId: req.user.id,
      role: "owner",
    });

    if (!ownerPorter) {
      return res.status(404).json({
        success: false,
        message: "Team owner not found",
      });
    }

    const { status } = req.query;

    const query = { assignedTeamId: ownerPorter.teamId };
    if (status) {
      query.status = status;
    }

    const bookings = await PorterBooking.find(query)
      .populate("userId", "name email phone")
      .populate("assignedPorters.porterId", "userId")
      .populate({
        path: "assignedPorters.porterId",
        populate: { path: "userId", select: "name phone" },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching team booking history:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking history",
      error: error.message,
    });
  }
};

export const getTeamPendingBookings = async (req, res) => {
  try {
    const ownerPorter = await Porters.findOne({
      userId: req.user.id,
      role: "owner",
    });

    if (!ownerPorter) {
      return res.status(404).json({
        success: false,
        message: "Team owner not found",
      });
    }

    const bookings = await PorterBooking.find({
      status: "PENDING_TEAM_REVIEW",
      $or: [
        { assignedTeamId: ownerPorter.teamId }, // already assigned to this team
        { assignedTeamId: null },               // broadcast — any team can review
      ],
    })
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching pending bookings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending bookings",
      error: error.message,
    });
  }
};

export const getTeamQuorumReachedBookings = async (req, res) => {
  try {
    const ownerPorter = await Porters.findOne({
      userId: req.user.id,
      role: "owner",
    });

    if (!ownerPorter) {
      return res.status(404).json({
        success: false,
        message: "Team owner not found",
      });
    }

    const bookings = await PorterBooking.find({
      assignedTeamId: ownerPorter.teamId,
      status: "AWAITING_OWNER_CONFIRMATION",
    })
      .populate("userId", "name email phone")
      .populate({
        path: "memberResponses.porterId",
        populate: { path: "userId", select: "name email phone" },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching quorum reached bookings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch quorum reached bookings",
      error: error.message,
    });
  }
};
