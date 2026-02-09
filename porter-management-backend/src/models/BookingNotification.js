import mongoose from "mongoose";

const bookingNotificationSchema = new mongoose.Schema(
    {
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PorterBooking",
            required: true,
        },

        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        recipientRole: {
            type: String,
            enum: ["user", "porter", "team_lead"],
            required: true,
        },

        notificationType: {
            type: String,
            enum: [
                "BOOKING_CREATED",
                "PORTER_NOTIFIED",
                "BOOKING_ACCEPTED",
                "BOOKING_REJECTED",
                "TEAM_LEAD_NOTIFIED",
                "PORTERS_SELECTED",
                "PORTER_RESPONDED",
                "BOOKING_CONFIRMED",
                "BOOKING_CANCELLED",
                "BOOKING_COMPLETED",
            ],
            required: true,
        },

        title: {
            type: String,
            required: true,
        },

        message: {
            type: String,
            required: true,
        },

        data: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },

        isRead: {
            type: Boolean,
            default: false,
        },

        readAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

// Indexes for efficient queries
bookingNotificationSchema.index({ recipientId: 1, isRead: 1 });
bookingNotificationSchema.index({ bookingId: 1 });

export default mongoose.model("BookingNotification", bookingNotificationSchema);
