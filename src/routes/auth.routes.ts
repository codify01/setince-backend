import { Router } from "express";
import { addUser, adminLoginUser, loginUser, socialLogin } from "../controllers/auth.controller";

const authRouter = Router();




authRouter.post("/register", addUser)
authRouter.post("/login", loginUser)
authRouter.post("/admin/login", adminLoginUser)
authRouter.post("/social", socialLogin)




export default authRouter;
