const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const User = require('../../models/Users');

// @route   GET api/auth
// @desc    Get information from authorization
// @access  Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        return res.status(500).send({ message: 'Could not retrieve user from database' });
    }
});

module.exports = router;