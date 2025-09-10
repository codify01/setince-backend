import { getUserById, getUserByUsernameOrEmail } from '../services/userService';


export const fetchUserById = async (req, res) => {
    try{
        const id = req.user._id;
        if (!id) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const user = await getUserById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            message: 'User fetched successfully',
            user
        })
    }catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'User fetch failed', error: error.message });
    }
}

export const fetchUserByUsernameOrEmail = async (req, res) => {
    try{
        const { username, email } = req.query;
        if (!username && !email) {
            return res.status(400).json({ message: 'Username or Email is required' });
        }
        const user = await getUserByUsernameOrEmail(username, email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            message: 'User fetched successfully',
            user
        })
    }catch (error) {
        console.error('Error fetching user by username or email:', error);
        res.status(500).json({ message: 'User fetch by username or email failed', error: error.message });
    }
}


