const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const message = require('../../utils/message');
// const config = require('config');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, `../.env.${process.env.ENVIRONMENT}`)});

const User = require('../../models/Users');

// @route   POST api/users
// @desc    Create new user
// @access  Public
router.post('/', [
        check('name', "Name is required")
        .notEmpty(),
        check('email', 'Please include a valid email address').isEmail(),
        check('password', message.PASSWORD_TOO_SHORT)
        .isLength({
            min: 6
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        } 
        
        const { name, email, password } = req.body;

        try {
            // check if user exists
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ errors: [ {message: `User with email ${email} already exists.`} ]});
            }
            // get user gravatar
            const avatar = gravatar.url(email, {
                s: '200', 
                r: 'pg',
                d: 'mm'
            })
            
            user = new User({
                name,
                email,
                avatar,
                password
            });
    
            // encrypt password, create secure password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
            
            // return jsonwebtoken
            const payload = {
                user: {
                    id: user.id,
                }
            }

            jwt.sign(
                payload, 
                // config.get('jwtSecret'),
                process.env.JWT_SECRET,
                {expiresIn: 36000}, 
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                });
    
            // add user to database
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error!!!');
        }
    });

module.exports = router;