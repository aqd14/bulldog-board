const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const User = require('../../models/Users');
const Profile = require('../../models/Profiles');

// @route   GET api/profile/me
// @desc    Get logged-in user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne( {user: req.user.id} ).populate('user', ['name', 'avatar']); // add some user field to the Profile query
        if (!profile) {
            return res.status(400).json({ message: 'No profile for current user' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error!');
    }
});

module.exports = router;