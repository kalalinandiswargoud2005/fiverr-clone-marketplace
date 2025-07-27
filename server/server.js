// server/server.js (Updated to include User Routes)
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const admin = require('firebase-admin');
const http = require('http');
const { Server } = require('socket.io');

const gigRoutes = require('./routes/gigRoutes');
const gigController = require('./controllers/gigController');
const orderRoutes = require('./routes/orderRoutes');
const orderController = require('./controllers/orderController');
const reviewRoutes = require('./routes/reviewRoutes');
const reviewController = require('./controllers/reviewController');
const userRoutes = require('./routes/userRoutes'); // Import user routes
const userController = require('./controllers/userController'); // Import user controller
const { protect, admin: adminMiddleware } = require('./middleware/authMiddleware');
const adminRoutes = require('./routes/adminRoutes'); // Import admin routes
const adminController = require('./controllers/adminController'); // Import admin controller

dotenv.config();

const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;
if (!serviceAccountBase64) { /* ... */ } // This check is good
const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8')); // This parsing is correct
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET_URL
});

gigController.initializeFirebase(admin);
orderController.initializeFirebaseAdminForOrders(admin);
reviewController.initializeFirebaseAdminForReviews(admin);
userController.initializeFirebaseAdminForUsers(admin); // Initialize user controller
adminController.initializeFirebaseAdminForAdmin(admin);
const app = express();
app.use(express.json());
app.use(cors({
   origin: [
     "http://localhost:5173", // Allow your local frontend during development
     process.env.CORS_ORIGIN // Allow your deployed Vercel frontend
   ],
   methods: ["GET", "POST", "PUT", "DELETE"] // Ensure all methods are allowed for API calls
 }));
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"] // Add PUT method for user profile update
    }
});

app.get('/api/admin/test', protect, adminMiddleware, (req, res) => {
    res.status(200).json({ message: 'Welcome, Admin!', user: req.user });
});

// API Routes
app.use('/api/gigs', gigRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes); // Mount user routes
app.use('/api/admin', adminRoutes);
// --- Socket.io Logic (Keep this) ---
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.on('join_chat', (orderId) => { /* ... */ });
    socket.on('send_message', async (data) => { /* ... */ });
    socket.on('disconnect', () => { /* ... */ });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));