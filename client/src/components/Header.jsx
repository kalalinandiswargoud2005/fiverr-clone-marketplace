// client/src/components/Header.jsx (Complete & Corrected Code)
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';
import AuthModal from './AuthModal';
import { authenticatedFetch } from '../utils/api'; // Ensure this is imported

const Header = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  const [showFiverrProDropdown, setShowFiverrProDropdown] = useState(false);
  const [showExploreDropdown, setShowExploreDropdown] = useState(false);
  const [showLangCurrencyDropdown, setShowLangCurrencyDropdown] = useState(false);

  const [openCategory, setOpenCategory] = useState(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/gigs?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleAuthSuccess = () => {
    console.log("Authentication successful, modal will close.");
  };

  const mainCategories = [
    { name: 'Graphics & Design', path: '/gigs?category=Graphics%20%26%20Design',
      subCategories: [
        { name: 'Logo Design', path: '/gigs?category=Graphic%20Design&sub=Logo%20Design' },
        { name: 'Brand Style Guides', path: '/gigs?category=Graphic%20Design&sub=Brand%20Style%20Guides' },
        { name: 'Web & App Design', path: '/gigs?category=Graphic%20Design&sub=Web%20%26%20App%20Design' },
        { name: 'Illustration', path: '/gigs?category=Graphic%20Design&sub=Illustration' },
        { name: 'Image Editing', path: '/gigs?category=Graphic%20Design&sub=Image%20Editing' },
        { name: 'Print Design', path: '/gigs?category=Graphic%20Design&sub=Print%20Design' },
        { name: 'T-Shirts & Merchandise', path: '/gigs?category=Graphic%20Design&sub=T-Shirts%20%26%20Merchandise' },
        { name: 'Presentation Design', path: '/gigs?category=Graphic%20Design&sub=Presentation%20Design' },
        { name: 'Infographic Design', path: '/gigs?category=Graphic%20Design&sub=Infographic%20Design' },
        { name: 'Resume Design', path: '/gigs?category=Graphic%20Design&sub=Resume%20Design' },
        { name: 'Book Design', path: '/gigs?category=Graphic%20Design&sub=Book%20Design' },
        { name: 'Social Media Design', path: '/gigs?category=Graphic%20Design&sub=Social%20Media%20Design' },
      ]
    },
    {
      name: 'Programming & Tech', path: '/gigs?category=Programming%20%26%20Tech',
      subCategories: [
        { name: 'Website Development', path: '/gigs?category=Programming%20%26%20Tech&sub=Website%20Development' },
        { name: 'E-Commerce Development', path: '/gigs?category=Programming%20%26%20Tech&sub=E-Commerce%20Development' },
        { name: 'Mobile App Development', path: '/gigs?category=Programming%20%26%20Tech&sub=Mobile%20App%20Development' },
        { name: 'WordPress', path: '/gigs?category=Programming%20%26%20Tech&sub=WordPress' },
        { name: 'Shopify', path: '/gigs?category=Programming%20%26%20Tech&sub=Shopify' },
        { name: 'AI Development', path: '/gigs?category=Programming%20%26%20Tech&sub=AI%20Development' },
        { name: 'Game Development', path: '/gigs?category=Programming%20%26%20Tech&sub=Game%20Development' },
        { name: 'Cloud & Cybersecurity', path: '/gigs?category=Programming%20%26%20Tech&sub=Cloud%20%26%20Cybersecurity' },
        { name: 'Blockchain', path: '/gigs?category=Programming%20%26%20Tech&sub=Blockchain' },
        { name: 'Data Science & ML', path: '/gigs?category=Programming%20%26%20Tech&sub=Data%20Science%20%26%20ML' },
        { name: 'IT Support', path: '/gigs?category=Programming%20%26%20Tech&sub=IT%20Support' },
      ]
    },
    {
      name: 'Digital Marketing', path: '/gigs?category=Digital%20Marketing',
      subCategories: [
        { name: 'Search Engine Optimization (SEO)', path: '/gigs?category=Digital%20Marketing&sub=SEO' },
        { name: 'Search Engine Marketing (SEM)', path: '/gigs?category=Digital%20Marketing&sub=SEM' },
        { name: 'Social Media Marketing', path: '/gigs?category=Digital%20Marketing&sub=Social%20Media%20Marketing' },
        { name: 'Paid Social Media', path: '/gigs?category=Digital%20Marketing&sub=Paid%20Social%20Media' },
        { name: 'Video Marketing', path: '/gigs?category=Digital%20Marketing&sub=Video%20Marketing' },
        { name: 'E-Commerce Marketing', path: '/gigs?category=Digital%20Marketing&sub=E-Commerce%20Marketing' },
        { name: 'Email Marketing', path: '/gigs?category=Digital%20Marketing&sub=Email%20Marketing' },
        { name: 'Content Marketing', path: '/gigs?category=Digital%20Marketing&sub=Content%20Marketing' },
        { name: 'Affiliate Marketing', path: '/gigs?category=Digital%20Marketing&sub=Affiliate%20Marketing' },
        { name: 'Public Relations', path: '/gigs?category=Digital%20Marketing&sub=Public%20Relations' },
        { name: 'Marketing Strategy', path: '/gigs?category=Digital%20Marketing&sub=Marketing%20Strategy' },
      ]
    },
    {
      name: 'Video & Animation', path: '/gigs?category=Video%20%26%20Animation',
      subCategories: [
        { name: 'Video Editing', path: '/gigs?category=Video%20%26%20Animation&sub=Video%20Editing' },
        { name: 'Visual Effects', path: '/gigs?category=Video%20%26%20Animation&sub=Visual%20Effects' },
        { name: 'Logo Animation', path: '/gigs?category=Video%20%26%20Animation&sub=Logo%20Animation' },
        { name: 'Explainer Videos', path: '/gigs?category=Video%20%26%20Animation&sub=Explainer%20Videos' },
        { name: 'Character Animation', path: '/gigs?category=Video%20%26%20Animation&sub=Character%20Animation' },
        { name: 'Music Videos', path: '/gigs?category=Video%20%26%20Animation&sub=Music%20Videos' },
        { name: 'Product Videos', path: '/gigs?category=Video%20%26%20Animation&sub=Product%20Videos' },
        { name: 'AI Video', path: '/gigs?category=Video%20%26%20Animation&sub=AI%20Video' },
        { name: 'Animated GIFs', path: '/gigs?category=Video%20%26%20Animation&sub=Animated%20GIFs' },
        { name: 'Social Media Videos', path: '/gigs?category=Video%20%26%20Animation&sub=Social%20Media%20Videos' },
      ]
    },
    {
      name: 'Writing & Translation', path: '/gigs?category=Writing%20%26%20Translation',
      subCategories: [
        { name: 'Articles & Blog Posts', path: '/gigs?category=Writing%20%26%20Translation&sub=Articles%20%26%20Blog%20Posts' },
        { name: 'Proofreading & Editing', path: '/gigs?category=Writing%20%26%20Translation&sub=Proofreading%20%26%20Editing' },
        { name: 'Translation', path: '/gigs?category=Writing%20%26%20Translation&sub=Translation' },
        { name: 'Website Content', path: '/gigs?category=Writing%20%26%20Translation&sub=Website%20Content' },
        { name: 'Scriptwriting', path: '/gigs?category=Writing%20%26%20Translation&sub=Scriptwriting' },
        { name: 'Creative Writing', path: '/gigs?category=Writing%20%26%20Translation&sub=Creative%20Writing' },
        { name: 'Resume Writing', path: '/gigs?category=Writing%20%26%20Translation&sub=Resume%20Writing' },
        { name: 'Business Copy', path: '/gigs?category=Writing%20%26%20Translation&sub=Business%20Copy' },
        { name: 'UX Writing', path: '/gigs?category=Writing%20%26%20Translation&sub=UX%20Writing' },
        { name: 'Technical Writing', path: '/gigs?category=Writing%20%26%20Translation&sub=Technical%20Writing' },
      ]
    },
    {
      name: 'Music & Audio', path: '/gigs?category=Music%20%26%20Audio',
      subCategories: [
        { name: 'Voice Over', path: '/gigs?category=Music%20%26%20Audio&sub=Voice%20Over' },
        { name: 'Mixing & Mastering', path: '/gigs?category=Music%20%26%20Audio&sub=Mixing%20%26%20Mastering' },
        { name: 'Music Producers', path: '/gigs?category=Music%20%26%20Audio&sub=Music%20Producers' },
        { name: 'Singers & Vocalists', path: '/gigs?category=Music%20%26%20Audio&sub=Singers%20%26%20Vocalists' },
        { name: 'Songwriters', path: '/gigs?category=Music%20%26%20Audio&sub=Songwriters' },
        { name: 'Jingles & Intros', path: '/gigs?category=Music%20%26%20Audio&sub=Jingles%20%26%20Intros' },
        { name: 'Podcast Production', path: '/gigs?category=Music%20%26%20Audio&sub=Podcast%20Production' },
        { name: 'Audio Ads Production', path: '/gigs?category=Music%20%26%20Audio&sub=Audio%20Ads%20Production' },
        { name: 'Sound Design', path: '/gigs?category=Music%20%26%20Audio&sub=Sound%20Design' },
        { name: 'Online Music Lessons', path: '/gigs?category=Music%20%26%20Audio&sub=Online%20Music%20Lessons' },
      ]
    },
    {
      name: 'Business', path: '/gigs?category=Business',
      subCategories: [
        { name: 'Virtual Assistant', path: '/gigs?category=Business&sub=Virtual%20Assistant' },
        { name: 'Business Plans', path: '/gigs?category=Business&sub=Business%20Plans' },
        { name: 'Market Research', path: '/gigs?category=Business&sub=Market%20Research' },
        { name: 'HR Consulting', path: '/gigs?category=Business&sub=HR%20Consulting' },
        { name: 'Legal Consulting', path: '/gigs?category=Business&sub=Legal%20Consulting' },
        { name: 'Data Analytics', path: '/gigs?category=Business&sub=Data%20Analytics' },
        { name: 'Presentations', path: '/gigs?category=Business&sub=Presentations' },
        { name: 'Financial Consulting', path: '/gigs?category=Business&sub=Financial%20Consulting' },
        { name: 'Project Management', path: '/gigs?category=Business&sub=Project%20Management' },
        { name: 'E-commerce Management', path: '/gigs?category=Business&sub=E-commerce%20Management' },
      ]
    },
    {
      name: 'Finance', path: '/gigs?category=Finance',
      subCategories: [
        { name: 'Accounting Services', path: '/gigs?category=Finance&sub=Accounting%20Services' },
        { name: 'Financial Reporting', path: '/gigs?category=Finance&sub=Financial%20Reporting' },
        { name: 'Bookkeeping', path: '/gigs?category=Finance&sub=Bookkeeping' },
        { name: 'Payroll Management', path: '/gigs?category=Finance&sub=Payroll%20Management' },
        { name: 'Tax Consulting', path: '/gigs?category=Finance&sub=Tax%20Consulting' },
        { name: 'Financial Planning & Analysis', path: '/gigs?category=Finance&sub=Financial%20Planning%20%26%20Analysis' },
        { name: 'Investments Advisory', path: '/gigs?category=Finance&sub=Investments%20Advisory' },
        { name: 'Fundraising', path: '/gigs?category=Finance&sub=Fundraising' },
        { name: 'Loan Advisory', path: '/gigs?category=Finance&sub=Loan%20Advisory' },
        { name: 'Credit Score Advisory', path: '/gigs?category=Finance&sub=Credit%20Score%20Advisory' },
      ]
    },
    {
      name: 'AI Services', path: '/gigs?category=AI%20Services',
      subCategories: [
        { name: 'AI Websites & Software', path: '/gigs?category=AI%20Services&sub=AI%20Websites%20%26%20Software' },
        { name: 'AI Mobile Apps', path: '/gigs?category=AI%20Services&sub=AI%20Mobile%20Apps' },
        { name: 'AI Automations & Agents', path: '/gigs?category=AI%20Services&sub=AI%20Automations%20%26%20Agents' },
        { name: 'Data Model Training', path: '/gigs?category=AI%20Services&sub=Data%20Model%20Training' },
        { name: 'AI Technology Consulting', path: '/gigs?category=AI%20Services&sub=AI%20Technology%20Consulting' },
        { name: 'AI Artists', path: '/gigs?category=AI%20Services&sub=AI%20Artists' },
        { name: 'AI Chatbot', path: '/gigs?category=AI%20Services&sub=AI%20Chatbot' },
        { name: 'Vibe Coding', path: '/gigs?category=AI%20Services&sub=Vibe%20Coding' },
        { name: 'Generative Engine Optimization', path: '/gigs?category=AI%20Services&sub=Generative%20Engine%20Optimization' },
        { name: 'AI Content', path: '/gigs?category=AI%20Services&sub=AI%20Content' },
      ]
    },
  ];


  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md py-3 z-50">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-3">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-fiverr-green flex items-center">
            <svg className="w-8 h-8 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-800">fiverr</span>
            <span className="text-fiverr-green text-3xl leading-none font-extrabold -ml-1">.</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-grow max-w-lg mx-4 hidden md:flex">
            <input
              type="text"
              placeholder="What service are you looking for today?"
              className="w-full p-2 pl-4 rounded-l-md border border-gray-300 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-fiverr-green"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-r-md transition-colors text-sm"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
            </button>
          </form>

          {/* Auth/User Options & Dropdowns */}
          <nav className="flex items-center space-x-4">
            {/* Admin Test Link */}
             {currentUser && userRole === 'admin' && (
              <Link
                to="/admin" // Link to the Admin Dashboard
                className="text-gray-700 hover:text-fiverr-green text-sm font-medium px-2 py-1 border rounded border-gray-300"
              >
                Admin Panel
              </Link>
            )}

            {/* Fiverr Pro Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setShowFiverrProDropdown(true)}
                onMouseLeave={() => setShowFiverrProDropdown(false)}
                className="text-gray-700 hover:text-fiverr-green text-sm font-medium flex items-center"
              >
                Fiverr Pro
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              {showFiverrProDropdown && (
                <div
                  onMouseEnter={() => setShowFiverrProDropdown(true)}
                  onMouseLeave={() => setShowFiverrProDropdown(false)}
                  className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                >
                  <Link to="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Service Catalog</Link>
                  <Link to="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Project Management</Link>
                  <Link to="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Expert Sourcing</Link>
                </div>
              )}
            </div>

            {/* Explore Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setShowExploreDropdown(true)}
                onMouseLeave={() => setShowExploreDropdown(false)}
                className="text-gray-700 hover:text-fiverr-green text-sm font-medium flex items-center"
              >
                Explore
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              {showExploreDropdown && (
                <div
                  onMouseEnter={() => setShowExploreDropdown(true)}
                  onMouseLeave={() => setShowExploreDropdown(false)}
                  className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                >
                  <Link to="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Answers</Link>
                  <Link to="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Community</Link>
                  <Link to="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Guides</Link>
                  <Link to="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Podcast</Link>
                  <Link to="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Learn</Link>
                  <Link to="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Blog</Link>
                </div>
              )}
            </div>

            {/* Language/Currency Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setShowLangCurrencyDropdown(true)}
                onMouseLeave={() => setShowLangCurrencyDropdown(false)}
                className="text-gray-700 hover:text-fiverr-green text-sm font-medium flex items-center"
              >
                EN ₹ INR
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              {showLangCurrencyDropdown && (
                <div
                  onMouseEnter={() => setShowLangCurrencyDropdown(true)}
                  onMouseLeave={() => setShowLangCurrencyDropdown(false)}
                  className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                >
                  <p className="px-4 py-2 text-xs text-gray-500">Language</p>
                  <Link to="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">English</Link>
                  <Link to="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Español</Link>
                  <p className="px-4 py-2 text-xs text-gray-500 mt-2">Currency</p>
                  <Link to="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">USD $</Link>
                  <Link to="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">INR ₹</Link>
                </div>
              )}
            </div>

            {/* Become a Seller (Direct Link) */}
            <Link to="#" className="text-gray-700 hover:text-fiverr-green text-sm font-medium">
              Become a Seller
            </Link>

            {currentUser ? (
              <>
                <Link to="/my-orders" className="text-gray-700 hover:text-fiverr-green text-sm font-medium">
                  Orders
                </Link>
                {/* Dashboard link will now point to a role-specific dashboard */}
                <Link
                  to={userRole === 'client' ? '/client-dashboard' : '/freelancer-dashboard'}
                  className="text-gray-700 hover:text-fiverr-green text-sm font-medium"
                >
                  Dashboard ({userRole})
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded text-sm font-medium bg-fiverr-green text-white hover:bg-green-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Buttons to open modal */}
                <button
                  onClick={() => { setAuthModalMode('login'); setShowAuthModal(true); }}
                  className="px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:text-fiverr-green"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setAuthModalMode('register'); setShowAuthModal(true); }}
                  className="px-3 py-1.5 rounded text-sm font-medium bg-fiverr-green text-white hover:bg-green-700"
                >
                  Join
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Category Navigation Bar */}
        <nav className="border-t border-gray-200 pt-3 mt-3 hidden md:block">
          <ul className="flex justify-start space-x-6">
            {mainCategories.map((category) => (
              <li
                key={category.name}
                className="relative" // Add relative for sub-category dropdown positioning
                onMouseEnter={() => setOpenCategory(category.name)} // Set active category on hover
                onMouseLeave={() => setOpenCategory(null)} // Close on leave
              >
                <Link
                  to={category.path}
                  className="text-sm font-medium text-gray-700 hover:text-fiverr-green transition-colors duration-200"
                  onClick={() => setOpenCategory(null)} // Close dropdown on click
                >
                  {category.name}
                </Link>
                {openCategory === category.name && category.subCategories && (
                  <div
                    className="absolute top-full left-0 mt-2 w-max bg-white rounded-md shadow-lg py-1 z-20 flex flex-col" // Changed to flex flex-col for single column
                    onMouseEnter={() => setOpenCategory(category.name)}
                    onMouseLeave={() => setOpenCategory(null)}
                  >
                    {category.subCategories.map((subCat) => (
                      <Link
                        key={subCat.name}
                        to={subCat.path}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap"
                        onClick={() => setOpenCategory(null)}
                      >
                        {subCat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

      </div>

      <AuthModal
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </header>
  );
};

export default Header;