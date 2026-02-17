import { Router } from "express";
import { addUser, adminLoginUser, loginUser } from "../controllers/auth.controller";

const authRouter = Router();




authRouter.post("/register", addUser)
authRouter.post("/login", loginUser)
authRouter.post("/admin/login", adminLoginUser)




export default authRouter;
