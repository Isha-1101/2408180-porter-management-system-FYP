import Porters from "../../../models/porter/Porters.js";
import porterBasicInfo from "../../../models/porter/porter-basic-info.js";
import PorterDocument from "../../../models/porter/porter-document-info.js";
import PorterVehicle from "../../../models/porter/porter-vehicle-info.js";
/**
 * Get Porter by Team ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response object with the fetched porter details
 * @throws {Error} - If an error occurred while fetching the porter
 * this will list the porter for Sepecific Team ID
 */
export const getPorterByTeamId = async (req, res) => {
  try {
    const { teamId } = req.params;
    if (!teamId) {
      return res.status(400).json({ message: "teamId parameter is required" });
    }

    const porter = await Porters.findOne({ teamId }).select(
      "-__v -createdAt -updatedAt",
    );

    if (!porter) {
      return res
        .status(404)
        .json({ message: "Porter not found for the given team ID" });
    }
    const [basicInfo, vehicle, documents] = await Promise.all([
      porterBasicInfo.findOne({ registrationId: porter.registrationId }),
      PorterVehicle.findOne({ registrationId: porter.registrationId }),
      PorterDocument.findOne({ registrationId: porter.registrationId }),
    ]);
    res
      .status(200)
      .json({ success: true, porter: porter, basicInfo, vehicle, documents });
  } catch (error) {
    console.error("Error fetching porter by team ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
