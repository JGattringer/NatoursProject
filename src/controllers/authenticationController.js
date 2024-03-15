const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordconfirm: req.body.passwordconfirm,
  });

  // CREATE JWT TOKEN FOR VERIFICATION OF USER FOR SING IN
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  // propertys are the same name as the varible so we can deconstruct str8
  const { email, password } = req.body;

  // 1) CHECK IF EMAIL/PASSWORD EXIST
  if (!email || !password) {
    return next(new AppError('Please provide a email e password', 400));
  }

  // 2) CHECK IF USER EXIST && PASSWORD IS CORRECT
  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('incorrect email or password', 401));
  }

  // 3) IF ALL GOOD SEND TOKEN TO CLIENT
  const token = signToken(user._id);
  res.status(200).json({
    status: 'sucess',
    token: token,
  });
});
