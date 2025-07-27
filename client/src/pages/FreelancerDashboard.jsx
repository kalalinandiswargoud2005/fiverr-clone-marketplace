// client/src/pages/FreelancerDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';

const FreelancerDashboard = () => {
  const { currentUser, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalEarnings: 0,
      myGigsCount: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentUserGigs, setRecentUserGigs] = useState([]);
  const [contentLoading, setContentLoading] = useState(true);

  // This component expects to be rendered ONLY if role is freelancer

  useEffect(() => {
      const fetchDashboardContent = async () => {
          if (!currentUser || authLoading || userRole !== 'freelancer') return; // Ensure freelancer role

          setStatsLoading(true);
          setContentLoading(true);
          try {
              let fetchedStats = { ...stats };
              let fetchedRecentUserGigs = [];

              const gigQ = query(collection(db, 'gigs'), where('userId', '==', currentUser.uid));
              const gigSnapshot = await getDocs(gigQ);
              fetchedStats.myGigsCount = gigSnapshot.size;

              const salesQ = query(collection(db, 'orders'), where('sellerId', '==', currentUser.uid));
              const salesSnapshot = await getDocs(salesQ);
              fetchedStats.totalOrders = salesSnapshot.size;
              fetchedStats.pendingOrders = salesSnapshot.docs.filter(doc => doc.data().status === 'pending' || doc.data().status === 'in progress').length;
              fetchedStats.completedOrders = salesSnapshot.docs.filter(doc => doc.data().status === 'completed').length;
              fetchedStats.totalEarnings = salesSnapshot.docs.filter(doc => doc.data().status === 'completed').reduce((sum, doc) => sum + (doc.data().price || 0), 0);

              // Fetch recent freelancer gigs (e.g., 3 most recent)
              const qRecentUserGigs = query(collection(db, 'gigs'),
                                            where('userId', '==', currentUser.uid),
                                            orderBy('createdAt', 'desc'),
                                            limit(3));
              const recentUserGigsSnapshot = await getDocs(qRecentUserGigs);
              fetchedRecentUserGigs = recentUserGigsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));


              setStats(fetchedStats);
              setRecentUserGigs(fetchedRecentUserGigs);

          } catch (error) {
              console.error("Error fetching freelancer dashboard content:", error);
              // Optionally set an error state here if needed
          } finally {
              setStatsLoading(false);
              setContentLoading(false);
          }
      };

      if (currentUser && userRole === 'freelancer') { // Only fetch if authenticated and explicitly a freelancer
          fetchDashboardContent();
      }
  }, [currentUser, userRole, authLoading]);


  if (authLoading || statsLoading || contentLoading) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">Loading freelancer dashboard...</div>;
  }

  const dashboardLinkClass = "w-full py-3 px-6 rounded-lg text-white font-bold transition duration-300 ease-in-out transform hover:scale-105";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-5xl text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">Welcome, {currentUser.username || currentUser.email}!</h2>
        <p className="text-xl text-gray-700 mb-8">Your Freelancer Dashboard</p>

        <div className="mb-10">
            <h3 className="text-2xl font-semibold text-gray-700 mb-6">Your Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <p className="text-base text-gray-600">My Gigs:</p>
                    <p className="text-4xl font-extrabold text-indigo-800 mt-2">{stats.myGigsCount}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <p className="text-base text-gray-600">Active Orders:</p>
                    <p className="text-4xl font-extrabold text-orange-800 mt-2">{stats.pendingOrders}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <p className="text-base text-gray-600">Total Earnings:</p>
                    <p className="text-4xl font-extrabold text-lime-800 mt-2">${stats.totalEarnings.toFixed(2)}</p>
                </div>
            </div>

            <div className="text-left mt-10">
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">Your Recent Gigs</h3>
                {recentUserGigs.length === 0 ? (
                    <p className="text-gray-600">No recent gigs. <Link to="/create-gig" className="text-blue-600 hover:underline">Create your first gig!</Link></p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recentUserGigs.map(gig => (
                            <div key={gig.id} className="bg-gray-50 p-4 rounded-lg shadow-sm flex items-center gap-4">
                                <img src={gig.images?.[0] || `https://picsum.photos/seed/${gig.id}/80/60`} alt={gig.title} className="w-16 h-12 object-cover rounded-md"/>
                                <div>
                                    <p className="font-semibold text-gray-800 line-clamp-1">{gig.title}</p>
                                    <p className="text-sm text-gray-600">Price: ${gig.price?.toFixed(0)}</p>
                                    <Link to={`/edit-gig/${gig.id}`} className="text-blue-600 hover:underline text-sm">Edit Gig</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>


            <div className="flex flex-col space-y-4 max-w-md mx-auto mt-10">
                <Link
                    to="/create-gig"
                    className={`${dashboardLinkClass} bg-fiverr-green hover:bg-green-700`}
                >
                    Create New Gig
                </Link>
                <Link
                    to="/my-gigs"
                    className={`${dashboardLinkClass} bg-blue-600 hover:bg-blue-700`}
                >
                    Manage My Gigs
                </Link>
                <Link
                    to="/my-orders"
                    className={`${dashboardLinkClass} bg-gray-600 hover:bg-gray-700`}
                >
                    View My Sales
                </Link>
            </div>
        </div>

        <button
          onClick={() => navigate('/')} // Back to Home
          className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default FreelancerDashboard;