const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// signup the user/add to DB
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

// login the user/check credentials
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

// Protect the rout for only logged in users have access
exports.protect = catchAsync(async (req, res, next) => {
  // 1) GETTING TOKEN AND CHECK IF EXIST
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401),
    );
  }
  // 2) VERIFICATE IF THE TOKEN IS VALID
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) CHECK IF USER STILL EXIST
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The User belongin to this Token does no longer exist!',
        401,
      ),
    );
  }
  // 4) CHECK IF USER CHANGED PASSWORD AFTER TOKEN WAS ISSUED
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently change its password, please login again!',
        401,
      ),
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ["admin", "lead-guide"]

    if (roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no User with this email address!', 404));
  }

  // 2) generate the random reset token
  const resetToken = user.createPasswordResetToken();
  // take out the required fields to be able to save it
  await user.save({ validateBeforeSave: false });
  // 3) send it to user email
  const resetURL = `${req.protocol}://${req.get('host')}/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didnt forget your password please ignore this email! `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message: message,
    });

    res.status(200).json({
      status: 'success',
      mesage: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was a error sending the email, please try again later',
        500,
      ),
    );
  }
});

exports.resetPassword = (req, res, next) => {};
