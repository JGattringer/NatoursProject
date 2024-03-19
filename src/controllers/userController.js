/*
Summary: This file contains controller functions for handling user-related operations like getting all users, getting a single user, creating a user, updating a user, and deleting a user. Each function returns a 500 status with an error message indicating that the route is not yet defined.
*/
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppErro = require('../utils/appError');

const filterOjb = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    resquestedAt: req.requestTime,
    data: {
      users: users,
    },
  });
});

exports.updateME = catchAsync(async (req, res, next) => {
  // 1) create error if user POSTs password data
  if (req.body.password || req.body.passwordconfirm) {
    return next(
      new AppErro(
        'This route is not for password update, please use /updateMyPassword for that',
        400,
      ),
    );
  }

  // 2) filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterOjb(req.body, 'name', 'email');

  // 3) update user document

  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
