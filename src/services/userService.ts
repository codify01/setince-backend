import UserModel, { User } from "../models/user.model";


export const createUser = async (userData:User) => {
    try{
        const user = new UserModel(userData);
        await user.save();
        return user;
    } catch (error) {
        console.error("Error creating user:", error);
        throw new Error(error);
    }
}

export const getUserById = async (userId: string) => {
    try {
        const user = await UserModel.findById(userId).select("-password")
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    } catch (error) {
        console.error("Error fetching user:", error);
        throw new Error("User fetch failed");
    }
}

export const getUserByUsernameOrEmail = async (username?: string, email?: string) => {
    try{
        const user = await UserModel.findOne({ $or: [{ username }, { email }] })
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }catch (error) {
        console.error("Error fetching user by username or email:", error);
        throw new Error("User fetch by username or email failed");
    }
}

export const updateUser = async (userId: string, updateData: Partial<User>) => {
    try {
        const user = await UserModel.findByIdAndUpdate(userId, updateData, { new: true });
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    } catch (error) {
        console.error("Error updating user:", error);
        throw new Error("User update failed");
    }
}

export const deleteUser = async (userId: string) => {
    try {
        const user = await UserModel.findByIdAndDelete(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    } catch (error) {   
        console.error("Error deleting user:", error);
        throw new Error("User deletion failed");
    }
}