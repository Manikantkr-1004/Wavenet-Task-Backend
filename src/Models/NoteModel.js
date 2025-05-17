import mongoose from "mongoose";

const collaboratorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  permission: { type: String, enum: ['Read', 'Write'] }
}, { _id: false });

const noteSchema = new mongoose.Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: {type:[collaboratorSchema], default:[]},
}, {versionKey: false, timestamps: true});

export const noteModel = mongoose.model("Note", noteSchema);