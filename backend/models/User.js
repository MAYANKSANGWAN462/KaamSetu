const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const locationSchema = new mongoose.Schema(
  {
    lat: { type: Number },
    lng: { type: Number },
    city: { type: String, trim: true, default: "" },
    area: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [80, "Name cannot exceed 80 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email",
      ],
    },
    phone: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator(v) {
          if (v == null || v === "") return true;
          return /^[0-9]{10}$/.test(String(v).trim());
        },
        message: "Phone must be exactly 10 digits",
      },
    },
    passwordHash: {
      type: String,
      select: false,
      default: "",
    },
    googleId: {
      type: String,
      sparse: true,
      trim: true,
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
      default: "",
    },
    verificationExpiry: {
      type: Date,
      select: false,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      select: false,
      default: null,
    },
    resetPasswordExpiry: {
      type: Date,
      select: false,
      default: null,
    },
    activeMode: {
      type: String,
      enum: {
        values: ["worker", "hirer", null],
        message: 'activeMode must be "worker" or "hirer"',
      },
      default: null,
      set: (v) => (v === "" || v === undefined ? null : v),
    },
    location: {
      type: locationSchema,
      default: () => ({}),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      trim: true,
      set: (v) => (!v || v === "worker" || v === "hirer" ? "user" : v),
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 }, { sparse: true });

userSchema.pre("save", async function hashPasswordIfNeeded(next) {
  if (!this.isModified("passwordHash") || !this.passwordHash) {
    return next();
  }
  const val = this.passwordHash;
  if (typeof val === "string" && val.startsWith("$2")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(String(val), salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function comparePassword(
  plainPassword,
) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(String(plainPassword), this.passwordHash);
};

module.exports = mongoose.model("User", userSchema);
