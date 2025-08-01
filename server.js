const express = require("express");
const app = express();
const db = require("./db");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('express-flash');
require("dotenv").config();
const jwt = require('jsonwebtoken');
const userSchema = require('./models/user');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());

// Set up EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/layout');

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to pass user data to views
app.use(async (req, res, next) => {
    const token = req.cookies?.token;
    
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded token:', decoded);
            
            // Now using decoded.id directly
            const user = await userSchema.findById(decoded.id);
            console.log('User found:', user);
            
            res.locals.user = user || null;
        } catch (err) {
            console.error('JWT Error:', err);
            res.locals.user = null;
            res.clearCookie('token');
        }
    } else {
        res.locals.user = null;
    }
    
    next();
});

// Routes
const userRouter = require("./routes/userRouter");
const candidateRouter = require("./routes/candidateRouter");

app.use("/user", userRouter);
app.use("/candidate", candidateRouter);

// Home route
app.get("/", function (req, res) {
    res.render("index", { 
        title: "Voting App Home",
        user: res.locals.user || null  // Explicitly pass user
    });
});


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Set default error message if none exists
    if (!err.message) {
        err.message = 'An unexpected error occurred';
    }
    
    res.status(500).render('error', { 
        title: 'Error', 
        error: err 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});