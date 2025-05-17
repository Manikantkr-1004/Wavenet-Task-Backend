import { Server } from "socket.io";
import { updateNoteContent } from "./Controllers/NoteController.js";

export const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTENDURL,
        },
    });

    console.log('Socket is Connected');


    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id);

        socket.on("join_event", async (data) => {
            try {
                socket.join(data.noteId);
                socket.to(data.noteId).emit("joiner_update", data);
            } catch (error) {
                console.error("Error in socket joining:", error);
            }
        });

        socket.on("send_update", async (data) => {
            try {
                console.log(data);
                
                const updatedData = await updateNoteContent({ noteId: data.noteId, userId: data.userId, newContent: data.newContent, newTitle: data.newtitle });

                socket.to(data.noteId).emit('receive_update', {data, note: updatedData});

            } catch (error) {
                console.error("Error in sending update by socket", error);
            }
        });

        // Handle disconnection
        socket.on("disconnect", async () => {
            try {
                console.log(`${socket.id} disconnected`);
            } catch (error) {
                console.error("Error in leftRoom:", error);
            }
        });

    });
};
