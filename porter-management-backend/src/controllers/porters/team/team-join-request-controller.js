import mongoose from "mongoose";
import Porters from "../../../models/porter/Porters.js";
import PorterTeam from "../../../models/porter/porterTeam.js";
import TeamJoinRequest from "../../../models/TeamJoinRequest.js";
import User from "../../../models/User.js";
import { getIO } from "../../../utils/socketInstance.js";

export const searchIndividualPorters = async (req, res) => {
  try {
    const { name, phone } = req.query;

    if (!name && !phone) {
      return res.status(400).json({
        success: false,
        message: "Provide name or phone to search",
      });
    }

    const team = await PorterTeam.findOne({ ownerId: req.user.id });
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found for this owner",
      });
    }

    const existingMemberIds = await Porters.find(
      { teamId: team._id },
      "_id",
    ).distinct("_id");

    const query = {
      porterType: "individual",
      status: { $in: ["active", "approved"] },
      _id: { $nin: existingMemberIds },
      teamId: null,
    };

    if (name) {
      const users = await User.find({
        name: { $regex: name, $options: "i" },
        role: "porter",
      }).distinct("_id");
      query.userId = { $in: users };
    }

    if (phone) {
      const users = await User.find({
        phone: { $regex: phone, $options: "i" },
        role: "porter",
      }).distinct("_id");
      query.userId = query.userId
        ? { $and: [query.userId, { $in: users }] }
        : { $in: users };
    }

    const porters = await Porters.find(query)
      .populate("userId", "name email phone")
      .select("-location -__v");

    return res.status(200).json({
      success: true,
      data: porters,
      message: `Found ${porters.length} eligible porters`,
    });
  } catch (error) {
    console.error("Error searching porters:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search porters",
      error: error.message,
    });
  }
};

export const invitePorterToTeam = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { porterId } = req.body;

    if (!porterId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Porter ID is required",
      });
    }

    const ownerPorter = await Porters.findOne({
      userId: req.user.id,
      role: "owner",
    }).session(session);

    if (!ownerPorter) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Team owner not found",
      });
    }

    const targetPorter = await Porters.findById(porterId).session(session);
    if (!targetPorter) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Porter not found",
      });
    }

    if (targetPorter.porterType !== "individual") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Can only invite individual porters",
      });
    }

    if (targetPorter.teamId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Porter is already in a team",
      });
    }

    const existingRequest = await TeamJoinRequest.findOne({
      teamId: ownerPorter.teamId,
      invitedPorterId: porterId,
      status: "PENDING",
    }).session(session);

    if (existingRequest) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "A pending invitation already exists for this porter",
      });
    }

    const [joinRequest] = await TeamJoinRequest.create(
      [
        {
          teamId: ownerPorter.teamId,
          invitedPorterId: porterId,
          invitedByOwnerId: ownerPorter._id,
          status: "PENDING",
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    const io = getIO();
    io.to(`porter:${targetPorter._id}`).emit("team-join-invitation", {
      requestId: joinRequest._id,
      teamId: ownerPorter.teamId,
      invitedBy: ownerPorter._id,
      message: "You have been invited to join a team",
    });

    return res.status(201).json({
      success: true,
      message: "Invitation sent successfully",
      data: { requestId: joinRequest._id },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error inviting porter:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send invitation",
      error: error.message,
    });
  }
};

export const respondToTeamInvitation = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { requestId } = req.params;
    const { action, reason } = req.body;

    if (!action || !["ACCEPTED", "DECLINED"].includes(action)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Action must be 'ACCEPTED' or 'DECLINED'",
      });
    }

    const joinRequest = await TeamJoinRequest.findById(requestId).session(
      session,
    );
    if (!joinRequest) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
    }

    if (joinRequest.status !== "PENDING") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "This invitation is no longer pending",
      });
    }

    const porterId = req.user.porterId;
    if (joinRequest.invitedPorterId.toString() !== porterId.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "You are not the invited porter",
      });
    }

    joinRequest.status = action;
    joinRequest.respondedAt = new Date();
    if (action === "DECLINED") {
      joinRequest.declinedReason = reason || null;
    }
    await joinRequest.save({ session });

    await session.commitTransaction();
    session.endSession();

    const io = getIO();
    const ownerPorter = await Porters.findById(joinRequest.invitedByOwnerId);

    if (ownerPorter) {
      io.to(`porter:${ownerPorter._id}`).emit("team-invitation-response", {
        requestId: joinRequest._id,
        porterId: joinRequest.invitedPorterId,
        action,
        reason: reason || null,
        message:
          action === "ACCEPTED"
            ? "Porter accepted your team invitation"
            : "Porter declined your team invitation",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        action === "ACCEPTED"
          ? "Invitation accepted. Awaiting admin approval."
          : "Invitation declined.",
      data: { joinRequest },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error responding to invitation:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to respond to invitation",
      error: error.message,
    });
  }
};

export const getPendingTeamJoinRequests = async (req, res) => {
  try {
    const ownerPorter = await Porters.findOne({ userId: req.user.id });
    if (!ownerPorter) {
      return res.status(404).json({
        success: false,
        message: "Porter not found",
      });
    }

    const requests = await TeamJoinRequest.find({
      teamId: ownerPorter.teamId,
      status: { $in: ["PENDING", "ACCEPTED", "DECLINED"] },
    })
      .populate("invitedPorterId", "userId")
      .populate({
        path: "invitedPorterId",
        populate: { path: "userId", select: "name email phone" },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching join requests:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch join requests",
      error: error.message,
    });
  }
};

export const getMyPendingInvitations = async (req, res) => {
  try {
    const porterId = req.user.porterId;
    if (!porterId) {
      return res.status(403).json({
        success: false,
        message: "Porter not found",
      });
    }

    const invitations = await TeamJoinRequest.find({
      invitedPorterId: porterId,
      status: "PENDING",
    })
      .populate("invitedByOwnerId", "userId")
      .populate({
        path: "invitedByOwnerId",
        populate: { path: "userId", select: "name email phone" },
      })
      .populate("teamId", "noOfMember isActive")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch invitations",
      error: error.message,
    });
  }
};

export const removeTeamMember = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { porterId } = req.params;

    const ownerPorter = await Porters.findOne({
      userId: req.user.id,
      role: "owner",
    }).session(session);

    if (!ownerPorter) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Team owner not found",
      });
    }

    const memberPorter = await Porters.findById(porterId).session(session);
    if (!memberPorter) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    if (memberPorter.teamId?.toString() !== ownerPorter.teamId.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "This porter is not a member of your team",
      });
    }

    memberPorter.teamId = null;
    memberPorter.role = "worker";
    await memberPorter.save({ session });

    await PorterTeam.findByIdAndUpdate(ownerPorter.teamId, {
      $pull: { members: { porterId: porterId } },
      $inc: { noOfMember: -1, noOfAvailableMember: -1 },
    }, { session });

    await session.commitTransaction();
    session.endSession();

    const io = getIO();
    io.to(`porter:${memberPorter._id}`).emit("team-member-removed", {
      teamId: ownerPorter.teamId,
      message: "You have been removed from the team",
    });

    return res.status(200).json({
      success: true,
      message: "Member removed from team successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error removing team member:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove team member",
      error: error.message,
    });
  }
};
