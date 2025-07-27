// server/routes/userRoutes.js
const express = require('express');
const { checkUsername, updateUserProfile } = require('../controllers/userController');

const router = express.Router();

router.post('/check-username', checkUsername); // Endpoint for checking uniqueness
router.put('/:uid', updateUserProfile);        // Endpoint for updating profile

module.exports = router;