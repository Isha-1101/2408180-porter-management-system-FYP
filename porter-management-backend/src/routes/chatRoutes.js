import express from "express";
import multer from "multer";
import { authenticate } from "../middlewares/authMiddleware.js";
import { attachPorterId } from "../middlewares/porterMiddleware.js";
import { getChatHistory } from "../controllers/chatController.js";
import {
  sendMessage,
  uploadFileMessage,
  markMessageAsRead,
  getUnreadCount,
  deleteMessage,
} from "../controllers/chatEnhancedController.js";

const router = express.Router();

// Multer for file uploads (max 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // Allow images and documents
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images and documents allowed."));
    }
  },
});

const protect = [authenticate, attachPorterId];

// Get chat history
router.get("/:bookingId", protect, getChatHistory);

// Send text message
router.post("/:bookingId/message", protect, sendMessage);

// Upload file and send
router.post("/:bookingId/upload", protect, upload.single("file"), uploadFileMessage);

// Mark message as read (read receipt)
router.put("/:messageId/read", protect, markMessageAsRead);

// Get unread count
router.get("/:bookingId/unread-count", protect, getUnreadCount);

// Delete message
router.delete("/:messageId", protect, deleteMessage);

export default router;
