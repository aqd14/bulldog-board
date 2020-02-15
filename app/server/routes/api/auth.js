const express = require('express')
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const message = require('../../utils/message')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, `../.env.${process.env.ENVIRONMENT}`) })

const User = require('../../models/Users')
const router = express.Router()

// @route   GET api/auth
// @desc    Get information from authorization
// @access  Public
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    return res.status(500).send({ message: message.SERVER_ERROR });
  }
})

// @route   POST api/auth
// @desc    Authenticate user and get token
// @access  Public
router.post('/', [
  check('email', message.INVALID_EMAIL).isEmail(),
  check('email', message.EMAIL_REQUIRED).exists(),
  check('password', message.PASSWORD_REQUIRED).exists()
],
async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const { email, password } = req.body;

  try {
    // console.log(email);
    const user = await User.findOne({ email });
    if (!user) {
      // console.error('could not find user with given email.');
      return res.status(400).json({ message: message.INVALID_CREDENTIALS });
    }

    // compare the plain password sent to server with stored hashed password in database
    // console.log(password, user.password)
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return res.status(400).json({ message: message.INVALID_CREDENTIALS });
    }

    const payload = {
      user: {
        id: user.id
      }
    }

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 36000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    )
  } catch (err) {
    console.error(err.message);
    res.status(500).send(message.SERVER_ERROR);
  }
})

module.exports = router;
