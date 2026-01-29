import User from "../../models/User.js";
import { generateToken } from "../../utils/generateToken.js";

export const switchToPorter = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role !== "user") {
      return res.status(400).json({ message: "User Cannot Switch To Porter" });
    }

    user.role = "porter";
    const updatedUser = await user.save();

    const token = generateToken(updatedUser);
    res.status(200).json({
      success: true,
      message: "Switched to porter successfully",
      access_token: token,
      user: {
        name: updatedUser.name,
        phone: updatedUser.phone,
        role: updatedUser.role,
        phone: updatedUser.phone,
      },
    });
  } catch (error) {
    console.error("Error switching to porter:", error);
    res.status(500).json({ message: "Failed to switch to porter" });
  }
};
