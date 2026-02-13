// team will request register to the admin
/**
 * @access team
 * @accept application/json
 * @returns {Object} - The response object with the fetched porter details
 * @throws {Error} - If an error occurred while fetching the porter
 * request auth for porter that are registered by team
 */
import bcrypt from "bcryptjs";
import porterTeam from "../../../models/porter/porterTeam.js";
import { RequestedUserPorter } from "../../../models/porter/requested-user-porter.js";
import User from "../../../models/User.js";
import registerApproveMailController from "../../../utils/nodeMailer/controller/registerApproveMailController.js";
/**
 * Team requests to register a new porter
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response object with the fetched porter details
 * @throws {Error} - If an error occurred while fetching the porter
 * request auth for porter that are registered by team
 * @example
 * // Request body
 * {
 *   "userName": "Ram Bahadur",
 *   "email": "ram@example.com",
 *   "phone": "9800000000"
 * }
 * @example
 * // Response
 * {
 *   "message": "Request submitted successfully and is awaiting admin approval"
 * }
 */
export const registerRequestForPorter = async (req, res) => {
  const { userName, email, phone } = req.body;
  try {
    const team = await porterTeam.findOne({ ownerId: req.user.id });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(404).json({ message: "User already exists" });
    }
    const newRequest = new RequestedUserPorter({
      teamId: team._id,
      userName,
      email,
      phone,
      porterType: "individual",
    });

    await newRequest.save();
    return res.status(200).json({
      message: "Request submitted successfully and is awaiting admin approval",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @returns all porter that are request by the team owner
 * @method: GET
 */
export const getAllRegisterRequestedPorter = async (req, res) => {
  const teamId = req.params.teamId;
  try {
    const requestedPorter = await RequestedUserPorter.find({
      teamId: teamId,
    });
    if (!requestedPorter) {
      return res
        .status(404)
        .json({ message: "Requested porter not found for the given team" });
    }
    return res.status(200).json({
      success: true,
      data: requestedPorter,
      message: "Requested porter fetched successfully",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

//admin register approved
export const approvePorterRegisterRequest = async (req, res) => {
  const requestId = req.params.id;
  try {
    const request = await RequestedUserPorter.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const { email, phone } = request;
    const password = Math.random().toString(36).slice(-8); // Generate a random 8-character password
    const user = await User.create({
      email,
      phone,
      role: "porter",
      isActive: true,
      password: bcrypt.hashSync(password, 10),
      registerdBy: "porter_team",
      name: request.userName,
      isTempPassword: true,
      teamId: request.teamId,
    });
    await request.deleteOne();
    await registerApproveMailController(user.email, user.name, password);
    return res.status(200).json({ message: "Request approved successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
