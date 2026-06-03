import jwt from 'jsonwebtoken'
import User from '../models/User.js';
import { sendSellerToken } from '../utils/sendToken.js';
import ErrorHandler from '../utils/errorHandler.js';

// api/seller/login

export const sellerLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return next(new ErrorHandler("Email and password are required", 200));

        const user = await User.findOne({ email });
        if (!user) return next(new ErrorHandler("Invalid email or password", 200));

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return next(new ErrorHandler("Invalid email or password", 200));

        sendSellerToken(user, 200, "Login success!", res);
    } catch (error) {
        next(error)
    }
}

//Check auth: api/seller/is-auth
export const isSellerAuth = async (req, res, next) => {
    try {
        return res.status(200).json({ success: true, user: req.user })
    } catch (error) {
        next(error);
    }
}

// api/seller/logout 

export const sellerLogout = async (req, res, next) => {
    try {
        res.clearCookie('sellerToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        })
        return res.status(200).json({
            success: true,
            message: "Logged out. See you again!"
        });
    } catch (error) {
        next(error)
    }
}


// [GET] /api/admin/users
export const getAllUsers = async (req, res, next) => {
    try {
        // 1. Get query parameters from URL
        const { page = 1, search = "", role = "" } = req.query;

        const limit = 10; // Number of users per page
        const skip = (page - 1) * limit;

        let query = {
            role: { $ne: "admin" }
        };

        // Search by name or email (Case-insensitive)
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        if (role && role !== "All") {
            query.role = role.toLowerCase();
        }

        // 3. Execute query with pagination and sorting
        const users = await User.find(query)
            .select("-password")
            .sort({ createdAt: -1 }) // Show newest members first
            .limit(limit)
            .skip(skip);

        // 4. Get total count for frontend pagination logic
        const totalMatchingUsers = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            count: totalMatchingUsers,
            data: users
        });
    } catch (error) {
        next(error);
    }
}

export const deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id;

        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }
        res.status(200).json({
            success: true,
            message: `User "${user.name}" has been deleted.`,
            id: req.params.id
        })
    } catch (error) {
        next(error)
    }
}

//[GET]