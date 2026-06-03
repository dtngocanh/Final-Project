import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import { sendToken } from "../utils/sendToken.js";
// api/user/register
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(404).json({message: "Missing credentials." })
        }
        const existingUser = await User.findOne({ email })

        if (existingUser)
            return res.status(404).json({ message: 'Email already exists.' })

        const user = await User.create({ name, email, password });

        sendToken(user, 201, "Account created! Welcome to the family!", res);

    } catch (error) {
        console.log(error.message);

        res.json({ success: false, message: error.message });

    }

}
// api/user/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(404).json({ message: 'Email and password are required' });

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Invalid email or password' })
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch)
            return res.status(404).json({ message: 'Invalid email or password' })

        sendToken(user, 201, "Welcome back! Happy shopping.", res);

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

//Check auth: api/user/is-auth
export const isAuth = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select("-password");
        return res.json({ success: true, user })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// api/user/logout 
export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        return res.json({ success: true, message: "Logged out. See you soon!" })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })

    }
}


// api/user/profile/update
export const updateProfile = async (req, res) => {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({ success: true, user, message: `Your profile is updated.` });
};
