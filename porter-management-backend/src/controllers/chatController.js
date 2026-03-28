import Message from "../models/Message.js";
import PorterBooking from "../models/PorterBooking.js";

export const getChatHistory = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await PorterBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const messages = await Message.find({ bookingId }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};
