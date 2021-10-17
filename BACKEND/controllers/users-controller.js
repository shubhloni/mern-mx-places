const HttpError = require('../models/http-error');
const { v4: uuid } = require('uuid');
const { validationResult } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const users = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (error) {
    return next(new HttpError(error, 500));
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed.', 422));
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    return next(new HttpError(error, 500));
  }

  if (existingUser) {
    return next(new HttpError('Email already exists.', 422));
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    return next(new HttpError('Could not create user. Please try again', 500));
  }

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    // 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png',
    password: hashedPassword,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError('Signup Failed. Try Again. ' + err, 500));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );
  } catch (error) {
    return next(new HttpError('Signup Failed. Try Again. ' + err, 500));
  }

  res.status(201).json({
    userId: createdUser.id,
    email: createdUser.email,
    token: token,
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    return next(new HttpError(error, 500));
  }

  if (!existingUser) {
    return next(new HttpError('User not exists.', 422));
  }

  let isValidPass = false;
  try {
    isValidPass = await bcrypt.compare(password, existingUser.password);
  } catch (error) {
    return next(new HttpError('User or password incorrect.', 422));
  }

  if (!isValidPass) {
    return next(new HttpError('User or password incorrect.', 422));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );
  } catch (error) {
    return next(new HttpError('Login Failed. Try Again. ' + err, 500));
  }

  res.status(201).json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  });
};

exports.users = users;
exports.signup = signup;
exports.login = login;
