import BookingNotification from "../models/BookingNotification.js";

/**
 * Notification Service
 * Handles all booking-related notifications
 * Can be extended to support Socket.IO, Firebase, email, SMS, etc.
 */

/**
 * Create and store a notification in the database
 */
const createNotification = async ({
    bookingId,
    recipientId,
    recipientRole,
    notificationType,
    title,
    message,
    data = {},
}) => {
    try {
        const notification = await BookingNotification.create({
            bookingId,
            recipientId,
            recipientRole,
            notificationType,
            title,
            message,
            data,
        });

        // TODO: Send real-time notification via Socket.IO if enabled
        // if (io) {
        //   io.to(recipientId.toString()).emit('booking-notification', notification);
        // }

        // TODO: Send push notification via Firebase
        // TODO: Send SMS notification
        // TODO: Send email notification

        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        throw error;
    }
};

/**
 * Notify individual porter about a booking request
 */
export const notifyPorter = async (porterId, booking, distance) => {
    const porter = await import("../models/porter/Porters.js").then((m) =>
        m.default.findById(porterId).populate("userId")
    );

    if (!porter || !porter.userId) return;

    return createNotification({
        bookingId: booking._id,
        recipientId: porter.userId._id,
        recipientRole: "porter",
        notificationType: "PORTER_NOTIFIED",
        title: "New Booking Request",
        message: `New ${booking.bookingType} booking request for ${booking.weightKg}kg. Distance: ${distance}km`,
        data: {
            bookingId: booking._id,
            bookingType: booking.bookingType,
            weight: booking.weightKg,
            distance,
            pickup: booking.pickup,
            drop: booking.drop,
        },
    });
};

/**
 * Notify team lead about a team booking request
 */
export const notifyTeamLead = async (teamLeadId, booking, distance) => {
    return createNotification({
        bookingId: booking._id,
        recipientId: teamLeadId,
        recipientRole: "team_lead",
        notificationType: "TEAM_LEAD_NOTIFIED",
        title: "New Team Booking Request",
        message: `New team booking request for ${booking.weightKg}kg, ${booking.teamSize} porters needed. Distance: ${distance}km`,
        data: {
            bookingId: booking._id,
            weight: booking.weightKg,
            teamSize: booking.teamSize,
            distance,
            pickup: booking.pickup,
            drop: booking.drop,
            requirements: booking.requirements,
            bookingDate: booking.bookingDate,
            bookingTime: booking.bookingTime,
        },
    });
};

/**
 * Notify user about booking status
 */
export const notifyUser = async (userId, booking, notificationType, customMessage = null) => {
    const messages = {
        BOOKING_CREATED: "Your booking request has been created successfully",
        BOOKING_ACCEPTED: "Your booking has been accepted by a porter",
        BOOKING_REJECTED: "Your booking was rejected. Searching for another porter...",
        BOOKING_CONFIRMED: "Your booking has been confirmed",
        BOOKING_CANCELLED: "Your booking has been cancelled",
        BOOKING_COMPLETED: "Your booking has been completed",
    };

    return createNotification({
        bookingId: booking._id,
        recipientId: userId,
        recipientRole: "user",
        notificationType,
        title: "Booking Update",
        message: customMessage || messages[notificationType] || "Booking status updated",
        data: {
            bookingId: booking._id,
            status: booking.status,
            bookingType: booking.bookingType,
        },
    });
};

/**
 * Notify multiple porters at once
 */
export const notifyMultiplePorters = async (porterIds, booking, distances) => {
    const notifications = [];

    for (let i = 0; i < porterIds.length; i++) {
        try {
            const notification = await notifyPorter(
                porterIds[i],
                booking,
                distances[i] || 0
            );
            notifications.push(notification);
        } catch (error) {
            console.error(`Failed to notify porter ${porterIds[i]}:`, error);
        }
    }

    return notifications;
};

/**
 * Notify team members about their selection
 */
export const notifyTeamMembers = async (porterIds, booking, teamLeadName) => {
    const notifications = [];

    for (const porterId of porterIds) {
        try {
            const porter = await import("../models/porter/Porters.js").then((m) =>
                m.default.findById(porterId).populate("userId")
            );

            if (!porter || !porter.userId) continue;

            const notification = await createNotification({
                bookingId: booking._id,
                recipientId: porter.userId._id,
                recipientRole: "porter",
                notificationType: "PORTERS_SELECTED",
                title: "Selected for Team Booking",
                message: `${teamLeadName} has selected you for a team booking. Please respond.`,
                data: {
                    bookingId: booking._id,
                    weight: booking.weightKg,
                    teamSize: booking.teamSize,
                    pickup: booking.pickup,
                    drop: booking.drop,
                },
            });

            notifications.push(notification);
        } catch (error) {
            console.error(`Failed to notify porter ${porterId}:`, error);
        }
    }

    return notifications;
};

/**
 * Notify team lead about porter responses
 */
export const notifyTeamLeadAboutResponse = async (
    teamLeadId,
    booking,
    porterName,
    accepted
) => {
    return createNotification({
        bookingId: booking._id,
        recipientId: teamLeadId,
        recipientRole: "team_lead",
        notificationType: "PORTER_RESPONDED",
        title: "Porter Response",
        message: `${porterName} has ${accepted ? "accepted" : "rejected"} the booking request`,
        data: {
            bookingId: booking._id,
            porterName,
            accepted,
        },
    });
};

/**
 * Get unread notifications for a user
 */
export const getUnreadNotifications = async (userId) => {
    return BookingNotification.find({
        recipientId: userId,
        isRead: false,
    })
        .sort({ createdAt: -1 })
        .populate("bookingId");
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId) => {
    return BookingNotification.findByIdAndUpdate(
        notificationId,
        {
            isRead: true,
            readAt: new Date(),
        },
        { new: true }
    );
};

/**
 * Mark all notifications as read for a user
 */
export const markAllAsRead = async (userId) => {
    return BookingNotification.updateMany(
        { recipientId: userId, isRead: false },
        {
            isRead: true,
            readAt: new Date(),
        }
    );
};

export default {
    notifyPorter,
    notifyTeamLead,
    notifyUser,
    notifyMultiplePorters,
    notifyTeamMembers,
    notifyTeamLeadAboutResponse,
    getUnreadNotifications,
    markAsRead,
    markAllAsRead,
};
