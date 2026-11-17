import mongoose from "../config/mongoose.js";
import bcrypt from "bcryptjs";
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from "../utils/constants.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [
        function () {
          return !this.googleId;
        },
        "Password is required",
      ],
      minlength: 8,
      select: false,
    },
    hasPassword: {
      type: Boolean,
      default: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      select: false,
    },
    avatar: {
      type: String,
      trim: true,
    },
    preferredCurrency: {
      type: String,
      enum: SUPPORTED_CURRENCIES,
      default: DEFAULT_CURRENCY,
    },
    tokenVersion: {
      type: Number,
      default: 0,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
  this.hasPassword = true;
  if (!this.isNew) this.tokenVersion = (this.tokenVersion || 0) + 1;
});

userSchema.methods.comparePassword = function (candidate) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

userSchema.set("toJSON", {
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.password;
    delete ret.tokenVersion;
    delete ret.googleId;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);

export default User;
