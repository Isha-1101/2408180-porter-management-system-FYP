import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";

export const register = async (req, res) => {
  if (
    !req.body.name ||
    !req.body.email ||
    !req.body.phone ||
    !req.body.password ||
    !req.body.role
  ) {
    return res.status(400).json({ success: false, message: "Invalid request" });
  }

  try {
    const { name, email, phone, password, role } = req.body;

    const GRACE_PERIOD_DAYS = 30;
    const graceDate = new Date(
      Date.now() - GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000
    );

    // Check existing user (active or deleted)
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    //Active user exists → block
    if (existingUser && existingUser.isDeleted === false) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //Deleted user exists
    if (existingUser && existingUser.isDeleted === true) {
      // Within grace period → restore
      if (existingUser.deletedAt && existingUser.deletedAt > graceDate) {
        existingUser.name = name;
        existingUser.phone = phone;
        existingUser.password = hashedPassword;
        existingUser.role = role;
        existingUser.isDeleted = false;
        existingUser.deletedAt = null;

        await existingUser.save();

        return res.status(200).json({
          success: true,
          message: "Account restored successfully",
          data: {
            name: existingUser.name,
            email: existingUser.email,
            phone: existingUser.phone,
            role: existingUser.role,
            token: generateToken(existingUser),
          },
        });
      }

      // Grace period expired → hard delete old record
      await User.deleteOne({ _id: existingUser._id });
    }

    // Create brand new user
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    const createdUser = await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        name: createdUser.name,
        email: createdUser.email,
        phone: createdUser.phone,
        role: createdUser.role,
      },
      access_token: generateToken(createdUser),
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Duplicate key safety
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    res
      .status(500)
      .json({ success: false, message: "Server error during registration" });
  }
};

export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "No account found" });
    }

    //check user is deleted or not
    if (user.isDeleted) {
      return res.status(403).json({
        success: false,
        message: "No account found",
      });
    }

    //check user is banned or not
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: `Due to "${user.remarks}", your account has been banned By Admin Please Contact Admin For More Details`,
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials" });
    }
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      access_token: generateToken(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

export const deleteUserAccounts = async (req, res) => {
  // user itself or admin can delete
  const userId = req.params.id;
  const currentDate = new Date();
  const { isDeleted } = req.body;
  try {
    const deletedUser = await User.findByIdAndUpdate(
      userId,
      { isDeleted: isDeleted, deletedAt: currentDate },
      { new: true }
    );
    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "No account found" });
    }
    res.status(200).json({
      success: true,
      message: "Account deleted. You can restore it within 30 days.",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the account.",
    });
  }
};

//admin onlyyy
export const banneduser = async (req, res) => {
  // admin only
  const userId = req.params.id;
  const { userStatus, remarks } = req.body;
  try {
    const bannedUser = await User.findByIdAndUpdate(
      userId,
      { isBanned: userStatus, remarks: remarks },
      { new: true }
    );
    if (!bannedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      message: "User banned successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error banning user:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while banning the user.",
    });
  }
};

//admin onlyyy
export const unbanneduser = async (req, res) => {
  // admin only
  const userId = req.params.id;
  const { remarks } = req.body;
  try {
    const unbannedUser = await User.findByIdAndUpdate(
      userId,
      { isBanned: false, remarks: remarks },
      { new: true }
    );
    if (!unbannedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      message: "User unbanned successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error unbanning user:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while unbanning the user.",
    });
  }
};

export const getAllUsersDetails = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      searchText,
      role,
      isBanned,
      isDeleted,
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const query = {};

    if (role) query.role = role;
    if (isBanned !== undefined) query.isBanned = isBanned === "true";
    if (isDeleted !== undefined) query.isDeleted = isDeleted === "true";
    if (searchText) {
      query.name = { $regex: searchText, $options: "i" };
    }

    const users = await User.find(query)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .select("-password  -__v");

    if (users.length === 0) {
      return res.status(204).json({
        success: true,
        message: "No users found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching users.",
    });
  }
};

// get access by both admin,porter,users by all
export const getUserById = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId).select("-password  -__v");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the user.",
    });
  }
};
