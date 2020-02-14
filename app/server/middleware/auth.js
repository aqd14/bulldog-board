const jwt = require('jsonwebtoken');
const message = require('../utils/message');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, `../.env.${process.env.ENVIRONMENT}`)});

module.exports = (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token');
    
    if (!token) {
        return res.status(401).json({ message: message.EMPTY_TOKEN });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(401).json({ message: message.INVALID_TOKEN });
    }
}