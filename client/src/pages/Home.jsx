// client/src/pages/Home.jsx (Updated with Featured Gigs Section)
import React, { useState, useEffect } from 'react'; // Import useEffect
import { useNavigate, Link } from 'react-router-dom';
import GigCard from '../components/GigCard'; // Import GigCard

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [featuredGigs, setFeaturedGigs] = useState([]); // New state for featured gigs
  const [loadingFeatured, setLoadingFeatured] = useState(true); // Loading state for featured gigs

  // Fetch featured gigs
  useEffect(() => {
    const fetchFeaturedGigs = async () => {
      setLoadingFeatured(true);
      try {
        // Fetch all gigs (you might want a specific backend endpoint for "featured" later)
        const response = await fetch('http://localhost:5000/api/gigs');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Take a subset of gigs (e.g., first 8 or random 8)
        setFeaturedGigs(data.slice(0, 8)); // Display up to 8 gigs
      } catch (err) {
        console.error("Error fetching featured gigs:", err);
        // Handle error, maybe display a message or empty state
      } finally {
        setLoadingFeatured(false);
      }
    };

    fetchFeaturedGigs();
  }, []); // Run once on component mount

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/gigs?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const categoriesData = [
    { name: 'AI Artists', img: 'https://cdn-icons-png.flaticon.com/512/8672/8672580.png', path: '/gigs?category=AI%20Artists' },
    { name: 'Logo Design', img: 'https://cdn-icons-png.flaticon.com/512/1049/1049283.png', path: '/gigs?category=Graphic%20Design' },
    { name: 'WordPress', img: 'https://cdn-icons-png.flaticon.com/512/174/174881.png', path: '/gigs?search=wordpress' },
    { name: 'Voice Over', img: 'https://cdn-icons-png.flaticon.com/512/2991/2991386.png', path: '/gigs?category=Music%20%26%20Audio' },
    { name: 'Video Explainer', img: 'https://cdn-icons-png.flaticon.com/512/2926/2926456.png', path: '/gigs?category=Video%20%26%20Animation' },
    { name: 'Social Media', img: 'https://cdn-icons-png.flaticon.com/512/121/121015.png', path: '/gigs?category=Digital%20Marketing' },
    { name: 'SEO', img: 'https://cdn-icons-png.flaticon.com/512/2920/2920251.png', path: '/gigs?category=Digital%20Marketing' },
    { name: 'Illustration', img: 'https://cdn-icons-png.flaticon.com/512/1940/1940713.png', path: '/gigs?category=Graphic%20Design' },
    { name: 'Translation', img: 'https://cdn-icons-png.flaticon.com/512/3246/3246410.png', path: '/gigs?category=Writing%20%26%20Translation' },
    { name: 'Data Entry', img: 'https://cdn-icons-png.flaticon.com/512/2920/2920786.png', path: '/gigs?category=Data' },
  ];

  return (
    <div className="font-sans">
      {/* Hero Section - With Video Background */}
      <div className="relative h-screen md:h-[calc(100vh-90px)] flex flex-col items-center justify-center text-white overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="https://videos.pexels.com/video-files/4426378/4426378-uhd_2560_1440_25fps.mp4"
          autoPlay
          loop
          muted
          playsInline
        ></video>

        <div className="absolute inset-0 bg-black opacity-50 z-10"></div>

        <div className="relative z-20 text-center max-w-4xl mx-auto flex flex-col justify-center items-center h-full pb-20">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-8 drop-shadow-lg">
            Find the right freelance service, right away.
          </h1>
          <form onSubmit={handleSearch} className="flex justify-center w-full max-w-xl mb-6">
            <input
              type="text"
              placeholder="Search for any service..."
              className="w-full p-4 pl-6 rounded-l-lg text-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-fiverr-green"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="bg-fiverr-green hover:bg-green-700 text-white p-4 rounded-r-lg font-semibold text-lg"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
            </button>
          </form>
          <div className="mt-4 text-base md:text-lg">
            <span className="font-semibold mr-3">Popular:</span>
            <Link to="/gigs?search=website%20design" className="inline-block px-4 py-1.5 border border-white rounded-full hover:bg-white hover:text-gray-800 transition-colors duration-200 text-sm md:text-base mr-2 mb-2">Website Design</Link>
            <Link to="/gigs?search=wordpress" className="inline-block px-4 py-1.5 border border-white rounded-full hover:bg-white hover:text-gray-800 transition-colors duration-200 text-sm md:text-base mr-2 mb-2">WordPress</Link>
            <Link to="/gigs?search=logo%20design" className="inline-block px-4 py-1.5 border border-white rounded-full hover:bg-white hover:text-gray-800 transition-colors duration-200 text-sm md:text-base mb-2">Logo Design</Link>
          </div>
        </div>

        {/* Trusted By Section */}
        <div className="absolute bottom-0 left-0 w-full z-20 py-4 text-center bg-transparent">
          <div className="container mx-auto px-4">
            <h3 className="text-xl font-semibold text-white mb-6">Trusted by leading brands</h3>
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/100px-Google_2015_logo.svg.png" alt="Google" className="h-6 md:h-8 opacity-90 hover:opacity-100 transition-opacity"/>
              <img src="data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20400%22%20width%3D%2250%22%20height%3D%2250%22%3E%0A%20%20%3Cpath%20fill%3D%22%231877F2%22%20d%3D%22M200%200C89.7%200%200%2089.7%200%20200c0%2099.8%2073.1%20182.4%20168.8%20197.2v-139.4h-50.8v-57.8h50.8v-44c0-50.3%2030.1-77.9%2076.3-77.9%2022.1%200%2045.2%203.9%2045.2%203.9v49.7h-25.5c-25.2%200-33.1%2015.6-33.1%2031.6v37.7h56.3l-9%2057.8h-47.3V397.2C326.9%20382.4%20400%20299.8%20400%20200%20400%2089.7%20310.3%200%20200%200z%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E%0A" alt="Meta" className="h-6 md:h-8 opacity-90 hover:opacity-100 transition-opacity"/>
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/100px-Netflix_2015_logo.svg.png" alt="Netflix" className="h-6 md:h-8 opacity-90 hover:opacity-100 transition-opacity"/>
              <img src="data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20512%20512%22%20width%3D%2250%22%20height%3D%2250%22%3E%0A%20%20%3Ccircle%20cx%3D%22256%22%20cy%3D%22256%22%20r%3D%22256%22%20fill%3D%22%23003399%22%3E%3C%2Fcircle%3E%0A%20%20%3Ctext%20x%3D%2250%25%22%20y%3D%2258%25%22%20text-anchor%3D%22middle%22%20fill%3D%22%23ffffff%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%22130%22%20font-weight%3D%22bold%22%3EP%26amp%3BG%3C%2Ftext%3E%0A%3C%2Fsvg%3E%0A" alt="P&G" className="h-6 md:h-8 opacity-90 hover:opacity-100 transition-opacity"/>
              <img src="data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20512%20512%22%20width%3D%2250%22%20height%3D%2250%22%3E%0A%20%20%3Cpath%20fill%3D%22%23003087%22%20d%3D%22M131.9%2022.4c-5.6%204.2-9.6%2010.3-10.6%2017.3l-64%20416.1c-1.7%2011.1%205.9%2021.4%2017%2023.1%201%20.2%202%20.3%203%20.3h91.1l15.6-99.5h39.2c96.4%200%20173.9-78.2%20181.5-180.7C414.5%2078.5%20335.5%200%20241.5%200h-86.6c-7.5%200-14.7%202.4-20.4%206.8z%22%3E%3C%2Fpath%3E%0A%20%20%3Cpath%20fill%3D%22%23009CDE%22%20d%3D%22M408.1%20199.4c-7.6%20102.5-85.1%20180.7-181.5%20180.7h-39.2l-15.6%2099.5h-52.5c-11.3%200-20.5-9.2-20.5-20.5v-.5l64-416.1c1-7%205-13.1%2010.6-17.3%205.7-4.4%2012.9-6.8%2020.4-6.8h86.6c94%200%20172.9%2078.5%20167.7%20180.7z%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E%0A" alt="PayPal" className="h-6 md:h-8 opacity-90 hover:opacity-100 transition-opacity"/>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section - Polished Grid */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Popular services</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {categoriesData.map((category) => (
            <Link
              key={category.name}
              to={category.path}
              className="block p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-fiverr-green transition-all duration-200 text-center"
            >
              <img src={category.img} alt={category.name} className="mx-auto mb-3 w-16 h-16 object-contain"/>
              <p className="font-semibold text-lg text-gray-800">{category.name}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* NEW: Featured Gigs Section */}
      {loadingFeatured ? (
        <div className="text-center py-12 text-gray-600 text-xl">Loading featured gigs...</div>
      ) : featuredGigs.length > 0 ? (
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
               <span className="text-fiverr-green">Made by Our Freelancers</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8">
              {featuredGigs.map((gig) => (
                <GigCard key={gig.id} gig={gig} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                to="/gigs"
                className="inline-block bg-fiverr-green text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Browse All Gigs
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-600 text-xl">No gigs to display yet.</div>
      )}

      {/* Fiverr Pro Marketing Section */}
      <div className="bg-fiverr-green text-white py-12">
        <div className="container mx-auto px-4 md:flex items-center gap-12">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <img
              src="https://images.pexels.com/photos/7698800/pexels-photo-7698800.jpeg"
              alt="Fiverr Pro"
              className="w-full h-auto rounded-lg shadow-xl"
            />
          </div>
          <div className="md:w-1/2 text-left">
            <h3 className="text-4xl font-bold mb-4">
              A whole new level of talent for your business.
            </h3>
            <p className="text-lg mb-6">
              Access top freelancers and agencies, offering bespoke services for your most complex projects. Enjoy dedicated account management, priority support, and powerful business tools.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-lg font-medium">
                <svg className="w-6 h-6 mr-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span>Money-back guarantee</span>
              </li>
              <li className="flex items-center text-lg font-medium">
                <svg className="w-6 h-6 mr-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span>Hand-picked talent by our team</span>
              </li>
              <li className="flex items-center text-lg font-medium">
                <svg className="w-6 h-6 mr-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span>Dedicated account management</span>
              </li>
            </ul>
            <Link
              to="#"
              className="inline-block bg-white text-fiverr-green font-bold py-3 px-8 rounded-lg text-lg hover:bg-gray-100 transition duration-300 ease-in-out transform hover:scale-105"
            >
              Explore Fiverr Pro
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;