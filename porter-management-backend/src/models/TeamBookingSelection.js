import mongoose from "mongoose";

const teamBookingSelectionSchema = new mongoose.Schema(
    {
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PorterBooking",
            required: true,
        },

        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PorterTeam",
            required: true,
        },

        teamLeadId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        selectedPorters: [
            {
                porterId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Porters",
                    required: true,
                },
                status: {
                    type: String,
                    enum: ["PENDING", "ACCEPTED", "REJECTED"],
                    default: "PENDING",
                },
                respondedAt: {
                    type: Date,
                    default: null,
                },
            },
        ],

        teamLeadConfirmed: {
            type: Boolean,
            default: false,
        },

        confirmedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

// Index for faster queries
teamBookingSelectionSchema.index({ bookingId: 1 });
teamBookingSelectionSchema.index({ teamId: 1 });

export default mongoose.model("TeamBookingSelection", teamBookingSelectionSchema);
