const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { jwtAuthMiddleware, generateToken } = require("../jwt");
const userSchema = require("../models/user");
const path = require('path');

// Login page
router.get('/login', (req, res) => {
    res.render('auth/login', { 
        title: 'Login',
        error: req.flash('error_msg')[0] // Get the first error message if exists
    });
});

// Signup page
router.get('/signup', async (req, res) => {
    const admin = await userSchema.findOne({ role: 'admin' });
    res.render('auth/signup', { 
        title: 'Sign Up',
        adminExists: !!admin,
        adminName: admin?.name || ''
    });
});

// User signup
router.post("/signup", async (req, res) => {
    try {
        const { name, age, email, mobile, idCardNumber, password, role } = req.body;

        // Check if trying to create admin account
        if (role === 'admin') {
            const existingAdmin = await userSchema.findOne({ role: 'admin' });
            if (existingAdmin) {
                req.flash('error_msg', `Admin account already exists (${existingAdmin.name})`);
                return res.redirect('/user/signup');
            }
        }

        let user = await userSchema.findOne({ idCardNumber });
        if (user) {
            req.flash('error_msg', 'User with this ID already exists!');
            return res.redirect('/user/signup');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await userSchema.create({
            name, email, age, mobile, idCardNumber,
            password: hashedPassword,
            role: role || 'voter'
        });

        const payload = { id: newUser.id, role: newUser.role };
        const token = generateToken(payload);
        
        res.cookie('token', token, { httpOnly: true });
        req.flash('success_msg', 'Registration successful!');
        res.redirect('/');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Registration failed. Please try again.');
        res.redirect('/user/signup');
    }
});

// User login
router.post("/login", async (req, res) => {
    try {
        const { idCardNumber, password } = req.body;
        let user = await userSchema.findOne({ idCardNumber });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            req.flash('error_msg', 'Invalid ID card number or password');
            return res.redirect('/user/login');
        }

        // Fix payload structure - remove the double nesting
        const payload = { 
            id: user.id,
            role: user.role 
        };
        
        const token = generateToken(payload);
        
        res.cookie('token', token, { 
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        
        req.flash('success_msg', 'Login successful!');
        res.redirect('/');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Login failed. Please try again.');
        res.redirect('/user/login');
    }
});
// Profile page
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.userData.id;
        const user = await userSchema.findById(userId);
        if (!user) {
            req.flash('error_msg', 'User not found');
            return res.redirect('/');
        }
        res.render('profile', { title: 'Profile', user });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error loading profile');
        res.redirect('/');
    }
});

// Update user password
router.post("/profile/password", jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.userData.id;
        const { currentPassword, newPassword } = req.body;

        const user = await userSchema.findById(userId);
        if (!user) {
            req.flash('error_msg', 'User not found');
            return res.redirect('/user/profile');
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            req.flash('error_msg', 'Invalid current password');
            return res.redirect('/user/profile');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        req.flash('success_msg', 'Password updated successfully');
        res.redirect('/user/profile');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error updating password');
        res.redirect('/user/profile');
    }
});

// Logout
router.get("/logout", (req, res) => {
    res.clearCookie('token');
    req.flash('success_msg', 'Logged out successfully');
    res.redirect('/');
});

module.exports = router;