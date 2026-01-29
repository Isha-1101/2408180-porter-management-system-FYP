import Porters from "../models/porter/Porters.js";

export const isPorterRegisteredAsTeam = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const porter = await Porters.findOne({ userId });
    if (!porter) {
      return res
        .status(404)
        .json({ message: "Porter not found for the given team ID" });
    }
    if (porter.porterType !== "team") {
      return res
        .status(400)
        .json({ message: "You cannot procced" });
    }
    next();
  } catch (error) {
    console.error("Error checking porter team registration:", error);
  }
};
