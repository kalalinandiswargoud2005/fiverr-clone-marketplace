// server/routes/gigRoutes.js
const express = require('express');
const {
  createGig,
  getAllGigs,
  getGigById,
  updateGig,
  deleteGig
} = require('../controllers/gigController');

const router = express.Router();

// No authentication middleware applied yet, will add in a later step
router.route('/').post(createGig).get(getAllGigs);
router.route('/:id').get(getGigById).put(updateGig).delete(deleteGig);

module.exports = router;