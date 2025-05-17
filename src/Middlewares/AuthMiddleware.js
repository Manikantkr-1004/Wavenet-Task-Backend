import { userModel } from "../Models/UserModel.js";
import jwt from "jsonwebtoken";

export const VerifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token || token==='null' || token==='undefined' || !token.trim()) {
        return res.status(401).send({message:'Token missing', data:null, error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findOne({email: decoded.email});        

        if(!user){
            return res.status(403).send({message:"Invalid Token, Refresh & Login", data:null, error:'Token mismatch'})
        }

        req.body = {...req.body, userId: decoded.userId, email:decoded.email};
        next();
    } catch (err) {
        res.status(401).send({message:"Invalid Token, Refresh & Login", data: null, error: 'Invalid token' });
    }
}