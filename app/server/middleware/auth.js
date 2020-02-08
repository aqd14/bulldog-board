const jwt = require('jsonwebtoken');
require('dotenv').config({ path:'.env.local'});

module.exports = (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token');
    
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denined!' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid!' });
    }
}