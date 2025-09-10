import { Router } from "express";
import { addUser, loginUser } from "../controllers/auth.controller";

const authRouter = Router();




authRouter.post("/register", addUser)
authRouter.post("/login", loginUser)




export default authRouter;