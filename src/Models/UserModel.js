import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {type: String, required: true},
  email: { type: String, unique: true, required: true },
  password: {type: String, required: true},
},{versionKey: false, timestamps: true});

export const userModel = mongoose.model('User', userSchema);