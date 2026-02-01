import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "porter", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PorterTeam",
      default: null,
    },
    registerdBy: {
      type: String,
      enum: ["self", "porter_team"],
      default: "self",
    },
    isTempPassword: {
      type: Boolean,
      required: true,
      default: false,
    },

    isBanned: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
