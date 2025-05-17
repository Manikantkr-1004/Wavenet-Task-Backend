import {Router} from "express";
import { UserAuthCheck, UserLogin, UserSignup } from "../Controllers/UserController.js";

export const userRouter = Router();

userRouter.route('/signup').post(UserSignup);
userRouter.route('/login').post(UserLogin);
userRouter.route('/check').get(UserAuthCheck);