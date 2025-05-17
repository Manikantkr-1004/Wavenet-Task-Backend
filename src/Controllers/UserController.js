import { userModel } from "../Models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const UserSignup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check these values in the request body
        if (!name || !email || !password) {
            return res.status(400).send({message:"Please provide all fields", data: null, error:'Form fields are empty'});
        }

        const checkUser = await userModel.findOne({ email });
        if (checkUser) {
            return res.status(422).send({message:"Email Already Exists", data: null, error: 'Email registered already'});
        }        

        const hashPassword = await bcrypt.hash(password, 4); //hashing the password

        // create a new user
        const newUser = new userModel({
            name,
            email,
            password: hashPassword,
        });
        await newUser.save();

        res.status(201).send({message:"User Registered Successfully", data:null, error: null});

    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", data: null, error })
    }
};

export const UserLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check these values in the request body
        if (!email || !password) {
            return res.status(400).send({message:"Please provide all fields", data: null, error:'Form fields are empty'});
        }
        
        // check if the email is registered
        const checkUser = await userModel.findOne({ email });
        if (!checkUser) {
            return res.status(400).send({message:"Email Not Registered", data:null, error:'User not found'});
        }

        bcrypt.compare(password, checkUser.password, async (err, result) => {
            if (err) {
                return res.status(400).send({ message: "Internal Server Error", data: null, error:"Error in Password Check" })
            }
            if (!result) {
                return res.status(400).send({ message: "Password is wrong", data: null, error:"Password not matched" });
            }

            // create a token and send it to the user
            const token = jwt.sign({ email, userId: checkUser._id }, process.env.JWT_SECRET, { expiresIn: "20m" });

            res.status(200).send({message:`Welcome Back, ${checkUser.name}`, data: {token, user: {name:checkUser.name, id: checkUser._id}}, error:null });

        });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", data: null, error })
    }
};

export const UserAuthCheck = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];        

        if(!token || token==='null' || token==='undefined' || !token.trim()){
            return res.status(401).send({message:"Token not provided", data:null, error:"Token not available"});
        }

        const {email} = jwt.verify(token, process.env.JWT_SECRET);
        
        // check if the email is registered
        const checkUser = await userModel.findOne({ email });
        if (!checkUser) {
            return res.status(400).send({message:"Token Invalid, Please Login", data:null, error:'User not found'});
        }
        
        res.status(200).send({message:`Welcome, ${checkUser.name}`, data: {name: checkUser.name, id: checkUser._id}, error:null });
        
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", data: null, error })
    }
};