import PorterRegistration from "../../models/porter/porter-registration.js";
import User from "../../models/User.js";
import PorterBasicInfo from "../../models/porter/porter-basic-info.js";
import PorterVehicle from "../../models/porter/porter-vehicle-info.js";
import PorterDocument from "../../models/porter/porter-document-info.js";

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
      .limit(parseInt(limit))
      .lean();

    const registrationIds = registrations.map((reg) => reg._id);

    const [basicInfos, vehicles, documents] = await Promise.all([
      PorterBasicInfo.find({ registrationId: { $in: registrationIds } }).lean(),
      PorterVehicle.find({ registrationId: { $in: registrationIds } }).lean(),
      PorterDocument.find({ registrationId: { $in: registrationIds } }).lean(),
    ]);

    const enrichedRegistrations = registrations.map((reg) => {
      const basicInfo = basicInfos.find(
        (b) => b.registrationId.toString() === reg._id.toString()
      );
      const vehicle = vehicles.find(
        (v) => v.registrationId.toString() === reg._id.toString()
      );
      const document = documents.find(
        (d) => d.registrationId.toString() === reg._id.toString()
      );

      return {
        ...reg,
        basicInfo: basicInfo || null,
        vehicle: vehicle || null,
        documents: document || null,
      };
    });

    const total = await PorterRegistration.countDocuments(query);

    res.status(200).json({
      success: true,
      data: enrichedRegistrations,
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
