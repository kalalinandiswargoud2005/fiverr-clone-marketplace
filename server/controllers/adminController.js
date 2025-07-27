// server/controllers/adminController.js
const admin = require('firebase-admin');
let db;
let adminInstance;

exports.initializeFirebaseAdminForAdmin = (firebaseAdmin) => {
    adminInstance = firebaseAdmin;
    db = firebaseAdmin.firestore();
};

// @desc    Get all users (for admin panel)
// @route   GET /api/admin/users
// @access  Private (Admin Only)
exports.getAllUsers = async (req, res) => {
    try {
        if (!db) throw new Error("Firebase Firestore not initialized.");
        const usersSnapshot = await db.collection('users').get();
        const users = [];
        usersSnapshot.forEach(doc => {
            users.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json(users);
    } catch (error) {
        console.error('Admin: Error fetching all users:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update a user's role (for admin panel)
// @route   PUT /api/admin/users/:uid/role
// @access  Private (Admin Only)
exports.updateUserRole = async (req, res) => {
    try {
        if (!db || !adminInstance) throw new Error("Firebase services not initialized.");
        const { uid } = req.params;
        const { role } = req.body;

        if (!role || !['admin', 'client', 'freelancer'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role provided.' });
        }

        // Prevent admin from downgrading themselves (optional but good practice)
        if (req.user.uid === uid && role !== 'admin') {
            return res.status(403).json({ message: 'Cannot downgrade your own admin role.' });
        }

        const userRef = db.collection('users').doc(uid);
        await userRef.update({
            role: role,
            updatedAt: adminInstance.firestore.FieldValue.serverTimestamp(),
        });

        res.status(200).json({ message: 'User role updated successfully!' });
    } catch (error) {
        console.error('Admin: Error updating user role:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a user (for admin panel)
// @route   DELETE /api/admin/users/:uid
// @access  Private (Admin Only)
exports.deleteUser = async (req, res) => {
    try {
        if (!db) throw new Error("Firebase Firestore not initialized.");
        const { uid } = req.params;

        // Prevent admin from deleting themselves
        if (req.user.uid === uid) {
            return res.status(403).json({ message: 'Cannot delete your own admin account.' });
        }

        // Delete user document from Firestore
        await db.collection('users').doc(uid).delete();
        res.status(200).json({ message: 'User deleted successfully!' });
    } catch (error) {
        console.error('Admin: Error deleting user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all gigs (for admin panel)
// @route   GET /api/admin/gigs
// @access  Private (Admin Only)
exports.getAllGigsAdmin = async (req, res) => {
    try {
        if (!db) throw new Error("Firebase Firestore not initialized.");
        const gigsSnapshot = await db.collection('gigs').get();
        const gigs = [];
        gigsSnapshot.forEach(doc => {
            gigs.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json(gigs);
    } catch (error) {
        console.error('Admin: Error fetching all gigs:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a gig (for admin panel)
// @route   DELETE /api/admin/gigs/:gigId
// @access  Private (Admin Only)
exports.deleteGigAdmin = async (req, res) => {
    try {
        if (!db) throw new Error("Firebase Firestore not initialized.");
        const { gigId } = req.params;
        await db.collection('gigs').doc(gigId).delete();
        res.status(200).json({ message: 'Gig deleted successfully!' });
    } catch (error) {
        console.error('Admin: Error deleting gig:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all orders (for admin panel)
// @route   GET /api/admin/orders
// @access  Private (Admin Only)
exports.getAllOrdersAdmin = async (req, res) => {
    try {
        if (!db) throw new Error("Firebase Firestore not initialized.");
        const ordersSnapshot = await db.collection('orders').get();
        const orders = [];
        ordersSnapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json(orders);
    } catch (error) {
        console.error('Admin: Error fetching all orders:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update order status (for admin panel, can update any order)
// @route   PUT /api/admin/orders/:orderId/status
// @access  Private (Admin Only)
exports.updateOrderStatusAdmin = async (req, res) => {
    try {
        if (!db || !adminInstance) throw new Error("Firebase services not initialized.");
        const { orderId } = req.params;
        const { status } = req.body;

        if (!status || !['pending', 'in progress', 'delivered', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided.' });
        }

        const orderRef = db.collection('orders').doc(orderId);
        await orderRef.update({
            status,
            updatedAt: adminInstance.firestore.FieldValue.serverTimestamp(),
        });

        res.status(200).json({ message: 'Order status updated successfully by Admin!' });
    } catch (error) {
        console.error('Admin: Error updating order status by admin:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};