// JavaScript code for defining routes related to tours using Express framework
const express = require('express');
const tourController = require('../controllers/toursController');
const authenticationController = require('../controllers/authenticationController');

const router = express.Router();

// router.param('id', tourController.checkID);
router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route('/')
  .get(authenticationController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
