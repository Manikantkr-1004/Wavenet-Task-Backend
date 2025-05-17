import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import rateLimit from "express-rate-limit"
import { ConnectMongodb } from './Config/MongoConfig.js';
import { initializeSocket } from './socket.js';
import { userRouter } from './Routes/UserRoutes.js';
import { noteRouter } from './Routes/NoteRoutes.js';

dotenv.config();

const PORT  = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);

const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 minutes
	limit: 100,
	legacyHeaders: false,
});

app.use(limiter);

app.use(cors({
    origin: process.env.FRONTENDURL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
}));
app.use(express.json());

app.use('/api/auth', userRouter);
app.use('/api/notes', noteRouter);

app.get('/', (req, res)=> {
    res.status(200).send({message: 'API is healthy', data: null, error: null});
})

app.use((req, res) => {
    res.status(404).send({ message: "API call is wrong", data: null, error: `${req.path} route or ${req.method} method not exist` });
});

app.use((err, req, res, next) => {
    console.error(err.stack,'error from server');
    res.status(500).send({ message: "Internal server error", error: err.message, data: null });
});

// socket.io connection
initializeSocket(server);

server.listen(PORT, async()=> {
    try {
        await ConnectMongodb();
        console.log(`Server is listening on ${PORT}`);
    } catch (error) {
        console.log('Server did not start', error);
    }
})
