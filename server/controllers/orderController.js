// server/controllers/orderController.js
const admin = require('firebase-admin'); // Keep this import for admin.firestore.FieldValue

let db; // Declare db here
let adminInstance; // Declare adminInstance here

exports.initializeFirebaseAdminForOrders = (firebaseAdmin) => {
    adminInstance = firebaseAdmin; // Assign admin instance
    db = firebaseAdmin.firestore(); // Assign db instance here
};

// @desc    Create an order (simulated purchase without Stripe)
// @route   POST /api/orders
// @access  Private (Client Only - will add middleware later)
exports.createOrder = async (req, res) => {
    try {
        if (!db || !adminInstance) { // Add checks to ensure they are initialized
            throw new Error("Firebase services not initialized in orderController.");
        }
        const { gigId, buyerId, sellerId, price } = req.body;

        if (!gigId || !buyerId || !sellerId || !price) {
            return res.status(400).json({ message: 'Missing required order details.' });
        }

        const gigDoc = await db.collection('gigs').doc(gigId).get();
        if (!gigDoc.exists) {
            return res.status(404).json({ message: 'Gig not found.' });
        }
        const gigData = gigDoc.data();
        const actualPrice = gigData.price;

        if (parseFloat(price) !== actualPrice) {
             return res.status(400).json({ message: 'Provided price does not match gig price.' });
        }

        const newOrderRef = db.collection('orders').doc();
        await newOrderRef.set({
            orderId: newOrderRef.id,
            gigId,
            buyerId,
            sellerId,
            price: parseFloat(price),
            status: 'pending',
            createdAt: adminInstance.firestore.FieldValue.serverTimestamp(),
            updatedAt: adminInstance.firestore.FieldValue.serverTimestamp(),
        });

        res.status(201).json({ message: 'Order created successfully!', orderId: newOrderRef.id });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get orders for a specific user (either buyer or seller)
// @route   GET /api/orders/my-orders/:userId
// @access  Private (Authenticated User - implement middleware later)
exports.getOrdersByUser = async (req, res) => {
    try {
        if (!db) { // Add check to ensure db is initialized
            throw new Error("Firebase Firestore not initialized in orderController.");
        }
        const { userId } = req.params;

        const buyerOrdersSnapshot = await db.collection('orders').where('buyerId', '==', userId).get();
        const sellerOrdersSnapshot = await db.collection('orders').where('sellerId', '==', userId).get();

        const orders = [];
        buyerOrdersSnapshot.forEach(doc => {
          orders.push({ id: doc.id, ...doc.data(), role: 'buyer' });
        });
        sellerOrdersSnapshot.forEach(doc => {
          if (!orders.some(order => order.id === doc.id)) {
            orders.push({ id: doc.id, ...doc.data(), role: 'seller' });
          }
        });

        orders.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:orderId/status
// @access  Private (Seller/Admin - implement middleware later)
exports.updateOrderStatus = async (req, res) => {
    try {
        if (!db || !adminInstance) { // Add checks to ensure they are initialized
            throw new Error("Firebase services not initialized in orderController.");
        }
        const { orderId } = req.params;
        const { status } = req.body;
        const requestingUserId = req.user?.uid;

        if (!status) {
          return res.status(400).json({ message: 'Status is required.' });
        }

        const orderRef = db.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
          return res.status(404).json({ message: 'Order not found.' });
        }

        const orderData = orderDoc.data();

        if (!requestingUserId || (requestingUserId !== orderData.buyerId && requestingUserId !== orderData.sellerId)) {
            return res.status(403).json({ message: 'Not authorized to update this order.' });
        }

        let allowedToUpdate = false;
        if (requestingUserId === orderData.sellerId) {
            if (['in progress', 'delivered', 'cancelled'].includes(status)) {
                allowedToUpdate = true;
            }
        } else if (requestingUserId === orderData.buyerId) {
            if (['completed', 'cancelled'].includes(status)) {
                allowedToUpdate = true;
            }
        }

        if (!allowedToUpdate) {
            return res.status(403).json({ message: `Not allowed to change status to "${status}" by your role.` });
        }


        await orderRef.update({
          status,
          updatedAt: adminInstance.firestore.FieldValue.serverTimestamp(),
        });

        res.status(200).json({ message: 'Order status updated successfully!', orderId });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};