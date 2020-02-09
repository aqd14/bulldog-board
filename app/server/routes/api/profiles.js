const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const User = require('../../models/Users');
const Profile = require('../../models/Profiles');

// @route   GET api/profiles/me
// @desc    Get logged-in user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne( {user: req.user.id} ).populate('user', ['name', 'avatar']); // add some user field to the Profile query
        if (!profile) {
            return res.status(400).json({ message: 'No profile for current user' });
        }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error!');
    }
});

// @route   POST api/profiles
// @desc    Create/update user's profile
// @access  Private
router.post('/', [auth, [
        check('status', 'Status is required.').notEmpty(),
        check('skills', 'Skills are required.').notEmpty()
    ]], 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const {
            title,
            website,
            location,
            bio,
            status,
            github,
            skills,
            youtube,
            facebook,
            twitter,
            linkedin,
            instagram
        } = req.body;
    
        // Build profile object
        const profileFields = {};
        profileFields.user = req.user.id;
        if (title) profileFields.title = title;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (github) profileFields.github = github;
        if (skills && skills.length > 0) profileFields.skills = skills.split(',').map(item => item.trim());

        // Build social object
        profileFields.social = {};
        if (youtube) profileFields.social.youtube = youtube;
        if (facebook) profileFields.social.facebook = facebook;
        if (twitter) profileFields.social.twitter = twitter;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (instagram) profileFields.social.instagram = instagram;

        // res.json(profileFields.skills);
        // Create new Profile document or update if profile doesn't exist
        try {
            let profile = await Profile.findOne({ user: req.user.id });
            if (profile) {
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                );
                return res.json(profile);
            }
            // profile doesn't exist, create new one
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);
        } catch (err) {
            console.log(err.message);
            res.status(500).send('Server error!');
        }
    }

);


// @route   GET api/profiles
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'email']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error!');
    }
})

// @route   GET api/profiles/user/:user_id
// @desc    Get profile given user id
// @access  Public
router.get('/user/:user_id', async (req, res) => {
    try {
        // console.log(req.params.user_id);
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name', 'email']);
        if (!profile) {
            return res.status(404).send(`Could not find profile associated with user id: ${req.params.user_id}`);
        }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        // if request contains invalid object id
        if (err.kind == 'ObjectId') {
            return res.status(404).send(`Could not find profile associated with user id: ${req.params.user_id}`);
        }
        res.status(500).send('Server Error!');
    }
})

module.exports = router; 