// JavaScript code for defining routes related to users using Express framework

const express = require('express');
const userController = require('../controllers/userController');
const authenticationController = require('../controllers/authenticationController');

const router = express.Router();

// Special route just for signup, cant be patch or update so it dont follow the rest form!
router.post('/signup', authenticationController.signup);
router.post('/login', authenticationController.login);

router.post('/forgotPassword', authenticationController.forgotPassword);
router.patch('/resetPassword/:token', authenticationController.resetPassword);
router.patch(
  '/updateMyPassword',
  authenticationController.protect,
  authenticationController.updatePassword,
);
router.patch(
  '/updateMe',
  authenticationController.protect,
  userController.updateME,
);
router.delete(
  '/deleteMe',
  authenticationController.protect,
  userController.deleteMe,
);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
