import mongoose from "mongoose";

export const ConnectMongodb = async()=> {
    try {
        await mongoose.connect(process.env.MONGOURL);
        console.log("MongoDB Database Connected");
    } catch (error) {
        console.log("MongoDB not connected", error);
    }
}