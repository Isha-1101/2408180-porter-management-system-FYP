import LocationLog from "../models/LocationLogs.js";
import Porter from "../models/Porters.js";
export const logLocation = async (req, res) => {
  try {
    const { porterId, teamId, lat, lng } = req.body;
    await LocationLog.create({
      porterId,
      teamId: teamId || null,
      latitude: lat,
      longitude: lng,
    });
    await Porter.findByIdAndUpdate(porterId, {
      latitude: lat,
      longitude: lng,
      lastLocationUpdate: Date.now(),
    });
    res.json({ message: "Location logged" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
