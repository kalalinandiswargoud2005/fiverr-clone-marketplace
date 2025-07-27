// server/routes/orderRoutes.js
const express = require('express');
const { createOrder, getOrdersByUser, updateOrderStatus } = require('../controllers/orderController'); // This line is correct

const router = express.Router();

router.post('/', createOrder); // Line 7
router.get('/my-orders/:userId', getOrdersByUser);
router.put('/:orderId/status', updateOrderStatus);

module.exports = router;