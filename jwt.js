const jwt = require("jsonwebtoken");

const jwtAuthMiddleware = (req, res, next) => {
    // First check for token in cookies
    const token = req.cookies?.token;
    
    // If not in cookies, check Authorization header
    if (!token) {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ err: "Token Not Found" });
        token = authHeader.split(' ')[1];
    }

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // Now just assigns the decoded payload directly
        next();
    } catch(err) {
        console.error('JWT Verification Error:', err);
        return res.status(401).json({ error: 'Invalid token' });
    }
};

const generateToken = (userData) => {
    return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '24h' });
}

module.exports = { jwtAuthMiddleware, generateToken };