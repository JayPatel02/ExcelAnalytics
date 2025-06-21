const userModel = require('../models/user.model');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.register = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false,
            message: 'Validation error', 
            errors: errors.array() 
        });
    }
    
    const { name, email, password } = req.body;
    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: 'User already exists' 
            });
        }
        
        const hashedPassword = await userModel.hashPassword(password);
        const newUser = new userModel({
            name,
            role: req.body.role || 'user', // Default role to 'user' if not provided
            email,
            password: hashedPassword
        });

        await newUser.save();
        const token = newUser.generateAuthToken();

        // Remove password from response
        const userResponse = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            createdAt: newUser.createdAt
        };

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user: userResponse
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
}

module.exports.login = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false,
            message: 'Validation error', 
            errors: errors.array() 
        });
    }
    
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid email or password' 
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid email or password' 
            });
        }

        const token = user.generateAuthToken();
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Remove password from response
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        };

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: userResponse
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
}

module.exports.logout = async (req, res, next) => {
    try {
        res.clearCookie('token'); 
        res.status(200).json({ 
            success: true,
            message: 'Logged out successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};
