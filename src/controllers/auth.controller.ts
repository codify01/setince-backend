import bcrypt from 'bcryptjs';
import UserModel, { User } from '../models/user.model';
import { createUser, getUserByUsernameOrEmail } from '../services/userService';
import {generateToken} from '../helpers/generateToken'


const addUser = async (req, res) => {
	const { firstName, lastName, username, email, password }: User = req.body;

	try {
		if (!firstName || !lastName || !username || !email || !password) {
			return res.status(400).json({ message: 'All fields are required' });
		}

		const existingUser = await UserModel.findOne({
			$or: [{ email }, { username }],
		});

		if (existingUser) {
			return res.status(409).json({
				message: existingUser.email === email
					? 'Email already exists'
					: 'Username already exists',
			});
		}

		const hashedPassword = await bcrypt.hash(password, 12);

		const newUser = await createUser({
			firstName,
			lastName,
			username,
			email,
			password: hashedPassword,
		});

		const token = await generateToken({id:newUser._id, username: newUser.username, email: newUser.email})

		res.status(201).json({
			message: 'User created successfully',
			user: {
				id: newUser._id,
				username: newUser.username,
				email: newUser.email,
			},
            token
		});
	} catch (error) {
		console.error('Error creating user:', error);
		res.status(500).json({ message: 'User creation failed', error: error.message });
	}
};

const loginUser = async (req, res) => {
	const { username, email, password }: { username: string; password: string, email: string } = req.body;
	try {
		const user = await getUserByUsernameOrEmail(username, email);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		user.lastLogin = new Date();
		await user.save();

		res.status(200).json({
			message: 'Login successful',
			user: {
				id: user._id,
				username: user.username,
				email: user.email,
				profilePic: user.profilePicture,
				firstName: user.firstName,
				lastName: user.lastName,
			},
			token: await generateToken({id:user._id, username: user.username, email: user.email})
		});
	} catch (error) {
		console.error('Error logging in:', error);
		res.status(500).json({ message: 'Login failed', error: error.message });
	}
};

export { addUser, loginUser };
