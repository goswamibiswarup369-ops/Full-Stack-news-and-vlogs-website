import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    preferredLanguage: { type: String, enum: ["en", "bn"], default: "en" },
    examTarget: { type: String, default: "" },
  },
  { timestamps: true },
);

export const User = model("User", userSchema);
