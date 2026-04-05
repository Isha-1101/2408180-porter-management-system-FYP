import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bookingType: {
      type: String,
      enum: ["individual", "team"],
      required: true,
    },

    pickup: {
      address: String,
      lat: Number,
      lng: Number,
    },

    drop: {
      address: String,
      lat: Number,
      lng: Number,
    },

    weightKg: {
      type: Number,
      required: true,
    },

    radiusKm: {
      type: Number,
      default: 5,
    },

    // Team booking specific fields
    teamSize: {
      type: Number,
      default: null,
    },

    requirements: {
      type: String,
      default: null,
    },

    bookingDate: {
      type: Date,
      default: null,
    },

    bookingTime: {
      type: String,
      default: null,
    },

    // Vehicle requirements
    hasVehicle: {
      type: Boolean,
      default: false,
    },

    vehicleType: {
      type: String,
      enum: ["bike", "van", "mini-truck", "truck", null, "motorcycle"],
      default: null,
    },

    numberOfVehicles: {
      type: Number,
      default: null,
    },

    // addons after discussion
    noOfFloors: {
      type: Number,
      default: null,
    },
    hasLift: {
      type: Boolean,
      default: false,
    },
    no_of_trips: {
      type: Number,
      default: null,
    },
    purpose_of_booking: {
      type: String,
      enum: ["transportation", "delivery"],
      default: "transportation",
    },

    status: {
      type: String,
      enum: [
        "SEARCHING",
        "WAITING_PORTER",
        "WAITING_TEAM_LEAD",
        "TEAM_LEAD_SELECTING",
        "WAITING_PORTER_CONFIRMATION",
        "WAITING_PORTER_RESPONSE",
        "TEAM_LEAD_CONFIRMING",
        "CONFIRMED",
        "IN_PROGRESS",
        "ASSIGNED",
        "CANCELLED",
        "COMPLETED",
      ],
      default: "SEARCHING",
    },

    assignedPorterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Porters",
      default: null,
    },

    assignedTeamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PorterTeam",
      default: null,
    },

    assignedPorters: [
      {
        porterId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Porters",
        },
        status: {
          type: String,
          enum: ["ASSIGNED", "COMPLETED"],
          default: "ASSIGNED",
        },
      },
    ],

    totalPrice: {
      type: Number,
      default: 0,
    },

    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "digital"],
      default: null,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "confirmed", "verified", "failed"],
      default: null,
    },

    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    cancellationReason: {
      type: String,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("PorterBooking", bookingSchema);
