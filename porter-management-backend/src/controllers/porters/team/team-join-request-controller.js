import mongoose from "mongoose";
import Porters from "../../../models/porter/Porters.js";
import PorterTeam from "../../../models/porter/porterTeam.js";
import TeamJoinRequest from "../../../models/TeamJoinRequest.js";
import User from "../../../models/User.js";

export const searchIndividualPorters = async (req, res) => {
  try {
    const { name, phone } = req.query;

    const query = {
      porterType: "individual",
      status: "active",
      isVerified: true,
    };

    if (name) {
      const users = await User.find({
        name: { $regex: name, $options: "i" },
      }).select("_id");

      query.userId = { $in: users.map((u) => u._id) };
    }

    if (phone) {
      const users = await User.find({
        phone: { $regex: phone, $options: "i" },
      }).select("_id");

      if (query.userId) {
        query.userId = { $in: [...query.userId, ...users.map((u) => u._id)] };
      } else {
        query.userId = { $in: users.map((u) => u._id) };
      }
    }

    const porters = await Porters.find(query)
      .populate("userId", "name email phone")
      .select("userId maxWeightKg status");

    const filteredPorters = porters.filter(
      (p) => p.userId && (!name || !phone),
    );

    return res.status(200).json({
      success: true,
      data: filteredPorters.length > 0 ? filteredPorters : porters,
    });
  } catch (error) {
    console.error("Error searching individual porters:", error);
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
    const currentPorterId = req.user.porterId;
    console.log(currentPorterId);

    if (!porterId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Porter ID is required",
      });
    }

    const teamLead = await Porters.findById(currentPorterId).session(session);
    if (!teamLead || teamLead.role !== "owner") {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "Only team owners can invite porters",
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

    if (targetPorter.porterType === "team") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Cannot invite a team porter",
      });
    }

    const existingRequest = await TeamJoinRequest.findOne({
      porterId: targetPorter._id,
      teamId: teamLead.teamId,
      status: "PENDING",
    }).session(session);

    if (existingRequest) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "An invitation is already pending for this porter",
      });
    }

    const [joinRequest] = await TeamJoinRequest.create(
      [
        {
          porterId: targetPorter._id,
          teamId: teamLead.teamId,
          invitedBy: teamLead.userId,
          status: "PENDING",
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Invitation sent successfully",
      data: { requestId: joinRequest._id },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error inviting porter to team:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to invite porter",
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
    const currentPorterId = req.user.porterId;

    if (!action || !["ACCEPTED", "DECLINED"].includes(action)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Action must be 'ACCEPTED' or 'DECLINED'",
      });
    }

    const joinRequest =
      await TeamJoinRequest.findById(requestId).session(session);
    if (!joinRequest) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Join request not found",
      });
    }

    if (joinRequest.porterId.toString() !== currentPorterId.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "This invitation is not for you",
      });
    }

    if (joinRequest.status !== "PENDING") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "This invitation has already been processed",
      });
    }

    joinRequest.status = action === "ACCEPTED" ? "ACCEPTED" : "DECLINED";
    joinRequest.responseReason = reason || null;
    joinRequest.respondedAt = new Date();
    await joinRequest.save({ session });

    if (action === "ACCEPTED") {
      const porter = await Porters.findById(currentPorterId).session(session);
      const team = await PorterTeam.findById(joinRequest.teamId).session(
        session,
      );

      if (porter && team) {
        porter.porterType = "team";
        porter.teamId = team._id;
        porter.role = "worker";
        await porter.save({ session });

        team.noOfMember += 1;
        team.noOfAvailableMember = (team.noOfAvailableMember || 0) + 1;
        await team.save({ session });

        const teamOwner = await Porters.findOne({
          teamId: team._id,
          role: "owner",
        }).session(session);
        if (teamOwner) {
          const teamOwnerUser = await User.findById(teamOwner.userId).session(
            session,
          );
          if (teamOwnerUser) {
            teamOwnerUser.teamId = team._id;
            teamOwnerUser.registerdBy = "porter_team";
            await teamOwnerUser.save({ session });
          }
        }
      }
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message:
        action === "ACCEPTED"
          ? "Invitation accepted! You are now part of the team."
          : "Invitation declined.",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error responding to team invitation:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to respond to invitation",
      error: error.message,
    });
  }
};

export const getPendingTeamJoinRequests = async (req, res) => {
  try {
    const currentPorterId = req.user.porterId;

    const teamLead = await Porters.findById(currentPorterId);
    if (!teamLead || teamLead.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only team owners can view join requests",
      });
    }

    const requests = await TeamJoinRequest.find({
      teamId: teamLead.teamId,
      status: "PENDING",
    })
      .populate("porterId", "userId maxWeightKg status")
      .populate({
        path: "porterId",
        populate: { path: "userId", select: "name email phone" },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching pending join requests:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch join requests",
      error: error.message,
    });
  }
};

export const getMyPendingInvitations = async (req, res) => {
  try {
    const currentPorterId = req.user.porterId;

    const invitations = await TeamJoinRequest.find({
      porterId: currentPorterId,
      status: "PENDING",
    })
      .populate("teamId", "ownerId noOfMember")
      .populate({
        path: "teamId",
        populate: { path: "ownerId", select: "name phone" },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    console.error("Error fetching pending invitations:", error);
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
    const currentPorterId = req.user.porterId;

    const teamLead = await Porters.findById(currentPorterId).session(session);
    if (!teamLead || teamLead.role !== "owner") {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "Only team owners can remove members",
      });
    }

    const memberToRemove = await Porters.findById(porterId).session(session);
    if (!memberToRemove) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    if (memberToRemove.teamId?.toString() !== teamLead.teamId?.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "This member is not in your team",
      });
    }

    if (memberToRemove.role === "owner") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Cannot remove team owner",
      });
    }

    memberToRemove.porterType = "individual";
    memberToRemove.teamId = null;
    memberToRemove.role = null;
    await memberToRemove.save({ session });

    await PorterTeam.findByIdAndUpdate(
      teamLead.teamId,
      {
        $inc: { noOfMember: -1, noOfAvailableMember: -1 },
      },
      { session },
    );

    await TeamJoinRequest.deleteMany({
      porterId: porterId,
      teamId: teamLead.teamId,
    }).session(session);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Team member removed successfully",
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
