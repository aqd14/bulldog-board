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
            console.error(err.message);
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
});

// @route   DELETE api/profiles
// @desc    Delete profile & user given authorized user
// @access  Private
router.delete('/', auth, async (req, res) => {
    try {
        // Profile.findByIdAndDelete(req.params.id, err => {
        //     if (err) return res.status(400).send(`Could not delete profile with associated id: ${req.params.id}`);
        //     res.status(410).send(`Successfully deleted profile id: ${req.params.id}`);
        // });

        // remove profile

        const deletedProfile = await Profile.findOneAndDelete({ user: req.user.id });
        if (!deletedProfile) {
            return res.status(500).json({
                message: 'Invalid delete request.',
            });
        }

        res.json({ message: 'Sucessfully deleted profile!' });
        // const deletedUser = 

        // console.log(req.user.id);
        // console.log(req.user);
        // await Profile.findOneAndDelete({ user: req.user.id }).then(profile => {
        //     res.json({
        //         'message': `Succesfully deleted profile ${profile._id}`, 
        //         'profile': profile
        //     });
        // }).catch(err => {
        //     res.status(500).json({
        //         'message': 'Invalid credentials.',
        //         'error': err
        //     });
        // });
        
        // await User.findOneAndDelete({ _id: req.user.id }).then(user => {
        //     res.json({
        //         'message': `Succesfully deleted user ${user.id}`, 
        //         'user': user
        //     });
        // }).catch(err => {
        //     res.status(500).json({
        //         'message': 'Invalid credentials.',
        //         'error': err
        //     });
        // });
        // remove associated user
        // await User.findOneAndRemove({ _id: req.user.id }).then(doc);
        // res.json({ message: 'Sucessfully deleted!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send(err);
    }
});


// @route   PUT api/profiles/experience
// @desc    Add experience to the current use
// @access  Private
router.put('/experience', [auth, 
    [
        check('title', 'Title is required.').notEmpty(),
        check('company', 'Company is required').notEmpty(),
        check('from', 'From date is required.').notEmpty(),
    ]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const exp = { title, company, location, from, to, current, description } = req.body;

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            return res.send({ message: "Invalid credentials!" }); // authorization succeeded but user doesn't exist
        }
        // put new experience at the beginning so that the latest experience will be on the top
        // When rendering user's experiences, however, we might want to sort data by working date
        // to ensure the chronological consistency
        profile.experience.unshift(exp);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send(err);
    }
});

module.exports = router; 