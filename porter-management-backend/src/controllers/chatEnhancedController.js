import Message from "../models/Message.js";
import MessageReceipt from "../models/MessageReceipt.js";
import PorterBooking from "../models/PorterBooking.js";
import cloudinary from "../config/cloudinary.js";

/**
 * Get chat history with pagination and read receipts
 * GET /core-api/chat/:bookingId
 */
export const getChatHistory = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const skip = (page - 1) * limit;

    const booking = await PorterBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const messages = await Message.find({ bookingId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get read receipts for messages
    const messageIds = messages.map((m) => m._id);
    const receipts = await MessageReceipt.find({
      messageId: { $in: messageIds },
    }).lean();

    // Attach receipts to messages
    const messagesWithReceipts = messages.map((msg) => ({
      ...msg,
      readBy: receipts.filter(
        (r) => r.messageId.toString() === msg._id.toString(),
      ),
    }));

    const total = await Message.countDocuments({ bookingId });

    res.status(200).json({
      success: true,
      data: messagesWithReceipts.reverse(), // Return in chronological order
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching chat history",
      error: error.message,
    });
  }
};

/**
 * Send text message
 * POST /core-api/chat/:bookingId/message
 */
export const sendMessage = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { text } = req.body;
    const senderId = req.user._id;
    const senderRole = req.user.role;

    // Validate input
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message text is required",
      });
    }

    // Verify booking exists
    const booking = await PorterBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Verify user has access to this booking
    if (
      senderRole === "user" &&
      booking.userId.toString() !== senderId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (
      senderRole === "porter" &&
      booking.assignedPorterId?.toString() !== senderId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Create message
    const message = new Message({
      bookingId,
      senderId,
      senderModel: senderRole === "user" ? "User" : "Porters",
      text: text.trim(),
    });

    await message.save();

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending message",
      error: error.message,
    });
  }
};

/**
 * Upload file and send as message
 * POST /core-api/chat/:bookingId/upload
 */
export const uploadFileMessage = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const senderId = req.user._id;
    const senderRole = req.user.role;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file provided",
      });
    }

    // Verify booking exists
    const booking = await PorterBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Verify user has access
    if (
      senderRole === "user" &&
      booking.userId.toString() !== senderId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (
      senderRole === "porter" &&
      booking.assignedPorterId?.toString() !== senderId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Upload to Cloudinary
    const uploadStream = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `chat-messages/${bookingId}`,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      stream.end(req.file.buffer);
    });

    // Create message with file
    const message = new Message({
      bookingId,
      senderId,
      senderModel: senderRole === "user" ? "User" : "Porters",
      fileUrl: uploadStream.secure_url,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      text: req.body.caption || null,
    });

    await message.save();

    res.status(201).json({
      success: true,
      message: "File sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Upload file error:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading file",
      error: error.message,
    });
  }
};

/**
 * Mark message as read
 * PUT /core-api/chat/:messageId/read
 */
export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const readerId = req.user._id;
    const readerRole = req.user.role;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if already read by this user
    const existingReceipt = await MessageReceipt.findOne({
      messageId,
      readBy: readerId,
    });

    if (existingReceipt) {
      return res.status(200).json({
        success: true,
        message: "Message already marked as read",
        data: existingReceipt,
      });
    }

    // Create read receipt
    const receipt = new MessageReceipt({
      messageId,
      bookingId: message.bookingId,
      readBy: readerId,
      readerModel: readerRole === "user" ? "User" : "Porters",
      readAt: new Date(),
    });

    await receipt.save();

    res.status(201).json({
      success: true,
      message: "Message marked as read",
      data: receipt,
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({
      success: false,
      message: "Error marking message as read",
      error: error.message,
    });
  }
};

/**
 * Get unread message count for booking
 * GET /core-api/chat/:bookingId/unread-count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    // Get all messages in booking
    const allMessages = await Message.find({ bookingId }).lean();

    // Get messages sent by others (not the requester)
    const otherMessages = allMessages.filter(
      (m) => m.senderId.toString() !== userId.toString(),
    );

    // Get read receipts for these messages by current user
    const readMessages = await MessageReceipt.find({
      messageId: { $in: otherMessages.map((m) => m._id) },
      readBy: userId,
    }).lean();

    const unreadCount = otherMessages.length - readMessages.length;

    res.status(200).json({
      success: true,
      data: {
        unreadCount,
        totalMessages: allMessages.length,
      },
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching unread count",
      error: error.message,
    });
  }
};

/**
 * Delete message (soft delete or real for unsent)
 * DELETE /core-api/chat/:messageId
 */
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Only sender can delete
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this message",
      });
    }

    // If message is very recent (< 1 minute), allow hard delete
    const messageAge = Date.now() - message.createdAt.getTime();
    if (messageAge < 60000) {
      // Hard delete
      await Message.findByIdAndDelete(messageId);
      await MessageReceipt.deleteMany({ messageId });
    } else {
      // Soft delete - keep message but clear content
      message.text = "[Message deleted]";
      message.fileUrl = null;
      message.fileName = null;
      message.fileType = null;
      await message.save();
    }

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting message",
      error: error.message,
    });
  }
};
