// client/src/pages/Gigs.jsx (Updated to match Home.jsx categories)
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import GigCard from '../components/GigCard';

const Gigs = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearchTerm = queryParams.get('search') || '';

  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedCategory, setSelectedCategory] = useState('');

  // These categories should ideally come from a central source or backend
  // For now, match the ones defined in Home.jsx for consistency
  const categories = [
    'Graphics & Design', 'Programming & Tech', 'Digital Marketing',
    'Video & Animation', 'Writing & Translation', 'Music & Audio',
    'Business', 'Finance', 'AI Services', 'AI Artists', 'WordPress',
    'Voice Over', 'Video Explainer', 'Social Media', 'SEO', 'Illustration',
    'Translation', 'Data' // Added categories from Home.jsx
  ];

  useEffect(() => {
    const fetchGigs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:5000/api/gigs');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setGigs(data);
      } catch (err) {
        console.error("Error fetching gigs:", err);
        setError("Failed to fetch gigs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, []);

  const filteredGigs = gigs.filter(gig => {
    const matchesSearchTerm = gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              gig.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || gig.category === selectedCategory;
    return matchesSearchTerm && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Explore Our Top Services</h1>

      {/* Search and Filter Section */}
      <div className="mb-10 flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
        <input
          type="text"
          placeholder="Search for services..."
          className="p-3 border border-gray-300 rounded-lg w-full md:w-1/2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-3 border border-gray-300 rounded-lg w-full md:w-1/4 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {/* Ensure categories here match categoriesData in Home.jsx or a subset */}
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Display Gigs */}
      {filteredGigs.length === 0 ? (
        <div className="text-center text-gray-600 text-xl mt-10">
          No gigs found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8">
          {filteredGigs.map((gig) => (
            <GigCard key={gig.id} gig={gig} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Gigs;