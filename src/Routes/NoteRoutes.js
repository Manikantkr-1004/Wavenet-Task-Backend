import { Router } from "express";
import { VerifyToken } from "../Middlewares/AuthMiddleware.js";
import { createNote, getUserNotes, getSingleUserNotes, deleteNote, shareNote } from "../Controllers/NoteController.js";

export const noteRouter = Router();

noteRouter.post("/create", VerifyToken, createNote);
noteRouter.get("/my-notes", VerifyToken, getUserNotes);
noteRouter.get('/single/:noteId', VerifyToken, getSingleUserNotes)
noteRouter.delete("/delete/:noteId", VerifyToken, deleteNote);
noteRouter.post("/share", VerifyToken, shareNote);
