// client/src/pages/ClientDashboard.jsx (UPDATED: Client Dashboard Video & Interactive How it Works)
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import GigCard from '../components/GigCard'; // Import GigCard for displaying gigs

const ClientDashboard = () => {
  const { currentUser, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalSpent: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [allGigs, setAllGigs] = useState([]);
  const [allGigsLoading, setAllGigsLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);


  useEffect(() => {
      const fetchDashboardContent = async () => {
          if (!currentUser || authLoading || userRole !== 'client') return;

          setStatsLoading(true);
          setContentLoading(true);
          setAllGigsLoading(true);

          try {
              let fetchedStats = { ...stats };
              let fetchedRecentOrders = [];
              let fetchedAllGigs = [];

              // --- Fetch Client's Overview Stats ---
              const qOrders = query(collection(db, 'orders'), where('buyerId', '==', currentUser.uid));
              const querySnapshotOrders = await getDocs(qOrders);
              fetchedStats.totalOrders = querySnapshotOrders.size;
              fetchedStats.pendingOrders = querySnapshotOrders.docs.filter(doc => doc.data().status === 'pending' || doc.data().status === 'in progress').length;
              fetchedStats.completedOrders = querySnapshotOrders.docs.filter(doc => doc.data().status === 'completed').length;
              fetchedStats.totalSpent = querySnapshotOrders.docs.reduce((sum, doc) => sum + (doc.data().price || 0), 0);

              // --- Fetch Recent Client Orders ---
              const qRecentClientOrders = query(collection(db, 'orders'), 
                                                where('buyerId', '==', currentUser.uid),
                                                orderBy('createdAt', 'desc'),
                                                limit(3));
              const recentClientOrdersSnapshot = await getDocs(qRecentClientOrders);

              const orderPromises = recentClientOrdersSnapshot.docs.map(async docSnapshot => {
                const orderData = docSnapshot.data();
                const gigDoc = await getDoc(doc(db, 'gigs', orderData.gigId));
                return {
                  id: docSnapshot.id,
                  ...orderData,
                  gigTitle: gigDoc.exists() ? gigDoc.data().title : 'Gig Unavailable',
                  gigImage: gigDoc.exists() && gigDoc.data().images?.[0] ? gigDoc.data().images[0] : `https://picsum.photos/seed/${orderData.gigId}/80/60`,
                };
              });
              fetchedRecentOrders = await Promise.all(orderPromises);

              // --- Fetch All Gigs (for display on client homepage) ---
              const gigsResponse = await fetch('http://localhost:5000/api/gigs');
              if (gigsResponse.ok) {
                  fetchedAllGigs = await gigsResponse.json();
              } else {
                  console.error("Failed to fetch all gigs for client dashboard:", gigsResponse.status);
              }

              setStats(fetchedStats);
              setRecentOrders(fetchedRecentOrders);
              setAllGigs(fetchedAllGigs);

          } catch (error) {
              console.error("Error fetching client dashboard content:", error);
          } finally {
              setStatsLoading(false);
              setContentLoading(false);
              setAllGigsLoading(false);
          }
      };

      if (currentUser && userRole === 'client') {
          fetchDashboardContent();
      }
  }, [currentUser, userRole, authLoading]);

  if (authLoading || statsLoading || contentLoading || allGigsLoading) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">Loading client homepage...</div>;
  }

  const dashboardLinkClass = "w-full py-3 px-6 rounded-lg text-white font-bold transition duration-300 ease-in-out transform hover:scale-105";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-7xl text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">Welcome, {currentUser.username || currentUser.email}!</h2>
        <p className="text-xl text-gray-700 mb-8">Your Client Homepage</p>

        {/* Client Overview Section */}
        <div className="mb-10">
            <h3 className="text-2xl font-semibold text-gray-700 mb-6">Your Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <p className="text-base text-gray-600">Total Orders:</p>
                    <p className="text-4xl font-extrabold text-blue-800 mt-2">{stats.totalOrders}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <p className="text-base text-gray-600">Pending Orders:</p>
                    <p className="text-4xl font-extrabold text-yellow-800 mt-2">{stats.pendingOrders}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <p className="text-base text-gray-600">Total Spent:</p>
                    <p className="text-4xl font-extrabold text-green-800 mt-2">${stats.totalSpent.toFixed(2)}</p>
                </div>
            </div>
        </div>

        {/* NEW: Video Section for Client Requirements (Updated Video Source) */}
        <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-lg mb-10 shadow-lg">
            <video
                className="absolute inset-0 w-full h-full object-cover z-0"
                src="https://videos.pexels.com/video-files/4384889/4384889-uhd_3840_2160_25fps.mp4" // UPDATED VIDEO SOURCE
                autoPlay
                loop
                muted
                playsInline
            ></video>
            <div className="absolute inset-0 bg-black bg-opacity-50 z-10 flex items-center justify-center">
                <div className="text-white text-center p-4 relative z-20">
                    <h3 className="text-3xl md:text-4xl font-bold mb-2">Tell us your needs, find your talent!</h3>
                    <p className="text-lg md:text-xl">Post a request and get offers from skilled freelancers.</p>
                    <Link to="/gigs" className="inline-block mt-4 bg-fiverr-green text-white font-bold py-2 px-6 rounded-lg text-base hover:bg-green-700 transition">
                        Discover Services
                    </Link>
                </div>
            </div>
        </div>


        {/* UPDATED: How Our Marketplace Works Section (More Interactive/Creative) */}
        <div className="py-10 mb-10 text-center"> {/* Centered text now */}
            <h2 className="text-3xl font-bold text-gray-800 mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start"> {/* Use items-start for consistent top alignment */}
                {/* Step 1 */}
                <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md border border-gray-200">
                    <div className="w-16 h-16 rounded-full bg-fiverr-green text-white flex items-center justify-center text-3xl font-bold mb-4">1</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Find a Service</h3>
                    <p className="text-gray-600 text-base leading-relaxed">Browse thousands of gigs offered by talented freelancers, or post your specific needs to get custom offers.</p>
                </div>
                {/* Step 2 */}
                <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md border border-gray-200">
                    <div className="w-16 h-16 rounded-full bg-fiverr-green text-white flex items-center justify-center text-3xl font-bold mb-4">2</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Order with Confidence</h3>
                    <p className="text-gray-600 text-base leading-relaxed">Securely purchase the service you need. Our platform ensures clear communication and milestones.</p>
                </div>
                {/* Step 3 */}
                <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md border border-gray-200">
                    <div className="w-16 h-16 rounded-full bg-fiverr-green text-white flex items-center justify-center text-3xl font-bold mb-4">3</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Collaborate & Review</h3>
                    <p className="text-gray-600 text-base leading-relaxed">Work directly with your freelancer. Once satisfied, mark the order complete and leave a review.</p>
                </div>
            </div>
        </div>

        {/* All Gigs Section for Client Homepage (remains unchanged) */}
        <div className="mb-10 text-left">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Explore All Gigs</h3>
            {allGigs.length === 0 ? (
                <p className="text-gray-600">No gigs available at the moment.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8">
                    {allGigs.map((gig) => (
                        <GigCard key={gig.id} gig={gig} />
                    ))}
                </div>
            )}
            <div className="text-center mt-8">
              <Link
                to="/gigs"
                className="inline-block bg-fiverr-green text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105"
              >
                View More Services
              </Link>
            </div>
        </div>

        {/* Client Specific Recent Orders Section (remains unchanged) */}
        <div className="text-left mt-10">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Your Recent Purchases</h3>
            {recentOrders.length === 0 ? (
                <p className="text-gray-600">No recent purchases. <Link to="/gigs" className="text-blue-600 hover:underline">Explore gigs!</Link></p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentOrders.map(order => (
                        <div key={order.id} className="bg-gray-50 p-4 rounded-lg shadow-sm flex items-center gap-4">
                            <img src={order.gigImage} alt="Order Gig" className="w-16 h-12 object-cover rounded-md"/>
                            <div>
                                <p className="font-semibold text-gray-800 line-clamp-1">{order.gigTitle}</p>
                                <p className="text-sm text-gray-600">Status: {order.status}</p>
                                <Link to={`/my-orders`} className="text-blue-600 hover:underline text-sm">View Details</Link>
                                </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Original Buttons from Dashboard (kept at bottom) */}
        <div className="flex flex-col space-y-4 max-w-md mx-auto mt-10">
            <Link
                to="/gigs"
                className={`${dashboardLinkClass} bg-fiverr-green hover:bg-green-700`}
            >
                Browse Services
            </Link>
            <Link
                to="/my-orders"
                className={`${dashboardLinkClass} bg-blue-600 hover:bg-blue-700`}
            >
                View All My Purchases
            </Link>
        </div>

        <button
          onClick={() => navigate('/')}
          className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ClientDashboard;