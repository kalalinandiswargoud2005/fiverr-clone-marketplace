// server/routes/reviewRoutes.js
const express = require('express');
const { addReview, getGigReviews, getMyReviews } = require('../controllers/reviewController');

const router = express.Router();

router.post('/', addReview);
router.get('/:gigId', getGigReviews); // Get reviews for a specific gig
router.get('/my-reviews/:userId', getMyReviews);

module.exports = router;