import { noteModel } from "../Models/NoteModel.js";
import { userModel } from "../Models/UserModel.js";

export const createNote = async (req, res) => {
    try {
        const { title, content, userId } = req.body;

        if (!title || !content) {
            return res.status(400).send({ message: "Title and content required", data:null, error:'Form fields missing' });
        }

        const newNote = new noteModel({
            title,
            content,
            createdBy: userId,
            collaborators: [],
        });

        await newNote.save();

        res.status(201).send({ message: "Note created", data: newNote, error:null });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error",data:null, error });
    }
};

export const getUserNotes = async (req, res) => {
    try {
        const {userId} = req.body;
        const { owner = "owner", page = 1, limit = 10 } = req.query;

        const skipping = page && limit ? ((Number(page)-1) * (Number(limit))) : 0;
        const limiting = page && limit ? Number(limit) : 0;
        
        let filter = {};
        if (owner === "owner") {
            filter = { createdBy: userId };
        } else if (owner === "shared") {
            filter = { "collaborators.userId": userId };
        }


        const notes = await noteModel
            .find(filter)
            .sort({ updatedAt: -1 })
            .skip(skipping)
            .limit(limiting);

        const totalCount = await noteModel
            .find(filter)
            .countDocuments();

        const totalPages = Math.ceil(totalCount/(Number(limit)));

        res.status(200).send({ message: "Notes fetched", data: {data:notes, totalPages }, error:null });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", data:null, error });
    }
};

export const getSingleUserNotes = async (req, res) => {
    try {
        const {userId} = req.body;
        const { noteId } = req.params;

        const note = await noteModel.findOne({_id: noteId});

        if (!note) {
            return res.status(404).send({ message: "Note not found", data:null, error:"Note ID is invalid" });
        }

        const isOwner = note.createdBy.toString() === userId;
        const isCollaborator = note.collaborators.some(
            (collab) => collab.userId.toString() === userId
        );

        if (!isOwner && !isCollaborator) {
            return res.status(403).send({ message: "Access denied", data:null, error:"Not authorized for access it" });
        }

        res.status(200).send({ message: "Note fetched", data: note , error:null});
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error",data:null, error });
    }
};

export const deleteNote = async (req, res) => {
    try {
        const {userId} = req.body;
        const { noteId } = req.params;

        const note = await noteModel.findOne({_id: noteId});

        if (!note || note.createdBy.toString() !== userId) {
            return res.status(403).send({ message: "Not authorized to delete this note", data:null, error:"Not authorized" });
        }
        
        await noteModel.findByIdAndDelete(noteId);
        
        res.status(200).send({ message: "Note deleted successfully", data:null, error:null });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", data:null, error });
    }
};

export const shareNote = async (req, res) => {
    try {
        const {userId, email} = req.body;
        const { noteId, userEmail, permission } = req.body;        

        if (!noteId || !userEmail || !permission) {
            return res.status(400).send({ message: "All fields are required", data:null, error:"some fields missing" });
        }

        const note = await noteModel.findById(noteId);
        if (!note || note.createdBy.toString() !== userId) {
            return res.status(403).send({ message: "Only owner can share this note", data:null, error:"Not authorized to share" });
        }

        const userToShare = await userModel.findOne({ email:userEmail });
        if (!userToShare) {
            return res.status(404).send({ message: "User not found with this email", data:null, error:"User not exist" });
        }

        if(userEmail === email){
            return res.status(404).send({message:"Owner can't share note to itself", data: null, error:"Owner self not sharing not allowed"})
        }

        const alreadyAdded = note.collaborators.find(
            (collab) => collab.userId.toString() === userToShare._id.toString()
        );        

        if (alreadyAdded) {
            alreadyAdded.permission = permission;
        } else {
            note.collaborators.push({ userId: userToShare._id, permission });
        }

        await note.save();        

        res.status(200).send({ message: "Note shared successfully", data: note, error:null });


    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", data:null, error });
    }
};

export const updateNoteContent = async ({ noteId, userId, newContent, newTitle }) => {

    const note = await noteModel.findOne({_id: noteId});
    if (!note) throw new Error("Note not found");

    const isOwner = note.createdBy.toString() === userId;
    const collaborator = note.collaborators.find(
        (collab) => collab.userId.toString() === userId
    );

    const hasWriteAccess = isOwner || (collaborator && collaborator.permission === "Write");
    if (!hasWriteAccess) throw new Error("No permission to update note");

    note.content = newContent;
    note.title = newTitle;

    await note.save();
    return note;
};
