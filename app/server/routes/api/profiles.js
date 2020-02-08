const express = require('express');

const router = express.Router();

// @route   GET api/profile
// @desc    Get information from user profile
// @access  Public
router.get('/', (req, res) => res.send('Profile route'));

module.exports = router;