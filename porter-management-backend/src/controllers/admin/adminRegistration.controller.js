import PorterRegistration from "../../models/porter/porter-registration.js";
import User from "../../models/User.js";

export const getAllRegistrations = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const registrations = await PorterRegistration.find(query)
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PorterRegistration.countDocuments(query);

    res.status(200).json({
      success: true,
      data: registrations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const rejectRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ success: false, message: "Rejection reason is required" });
    }

    const registration = await PorterRegistration.findOneAndUpdate(
      { registrationId: id },
      { status: "rejected", rejectionReason },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }

    res.status(200).json({
      success: true,
      message: "Registration rejected successfully",
      data: registration,
    });
  } catch (error) {
    console.error("Error rejecting registration:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
