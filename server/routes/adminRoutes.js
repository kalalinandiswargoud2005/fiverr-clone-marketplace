// server/routes/adminRoutes.js
const express = require('express');
const {
    getAllUsers, updateUserRole, deleteUser,
    getAllGigsAdmin, deleteGigAdmin,
    getAllOrdersAdmin, updateOrderStatusAdmin
} = require('../controllers/adminController');
const { protect, admin: adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes in this file will be protected by protect and adminMiddleware
router.use(protect, adminMiddleware); // Apply middleware to all routes in this router

// User Management
router.get('/users', getAllUsers);
router.put('/users/:uid/role', updateUserRole);
router.delete('/users/:uid', deleteUser);

// Gig Management
router.get('/gigs', getAllGigsAdmin);
router.delete('/gigs/:gigId', deleteGigAdmin);

// Order Management
router.get('/orders', getAllOrdersAdmin);
router.put('/orders/:orderId/status', updateOrderStatusAdmin);

module.exports = router;