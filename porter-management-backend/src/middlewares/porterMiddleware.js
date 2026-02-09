import Porters from "../models/porter/Porters.js";

/**
 * Middleware to attach porterId to request object for authenticated porters
 * Should be used after authenticate middleware
 */
export const attachPorterId = async (req, res, next) => {
    try {
        // Only attach if user is a porter
        if (req.user && req.user.role === "porter") {
            const porter = await Porters.findOne({ userId: req.user.id }).select("_id teamId role");

            if (porter) {
                req.user.porterId = porter._id;
                req.user.teamId = porter.teamId;
                req.user.porterRole = porter.role; // 'owner' or 'worker'
            }
        }
        next();
    } catch (error) {
        console.error("Error attaching porter ID:", error);
        next(); // Continue even if error - let route handlers deal with missing porterId
    }
};
