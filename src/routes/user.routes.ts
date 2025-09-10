import { Router } from "express";
import { addUser } from "../controllers/auth.controller";
import { fetchUserById } from "../controllers/user.controller";
import { protect } from "../middlewares/auth.middleware";

const userRouter = Router();

userRouter.use(protect)


userRouter.get("/profile", fetchUserById)




export default userRouter;