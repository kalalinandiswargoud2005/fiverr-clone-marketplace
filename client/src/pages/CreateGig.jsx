// client/src/pages/CreateGig.jsx (FIXED: Infinite Render Loop)
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const categories = [
    'Graphic Design', 'Digital Marketing', 'Writing & Translation',
    'Video & Animation', 'Music & Audio', 'Programming & Tech',
    'Business', 'Lifestyle', 'Data'
];

const CreateGig = () => {
    console.log("CreateGig Component Renders");

    const { gigId } = useParams();
    const isEditing = !!gigId;

    const { currentUser, userRole, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [price, setPrice] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');
    const [revisions, setRevisions] = useState('');
    const [images, setImages] = useState([]);
    const [imageUrlInput, setImageUrlInput] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [gigOwnerId, setGigOwnerId] = useState(null);

    useEffect(() => {
        console.log("--- CreateGig Auth/Redirect Effect Debug ---");
        console.log("authLoading:", authLoading);
        console.log("currentUser:", currentUser);
        console.log("userRole:", userRole);
        console.log("isEditing:", isEditing);
        console.log("---------------------------------");

        if (!authLoading) {
            if (!currentUser) {
                console.log("Auth Check: Not logged in. Redirecting to home.");
                navigate('/');
                return;
            } else if (userRole !== 'freelancer') {
                console.log("Auth Check: Not a freelancer. Redirecting to dashboard.");
                navigate('/dashboard');
                return;
            }
            console.log("Auth Check: User is a freelancer. Proceeding.");
        }
    }, [currentUser, userRole, authLoading, navigate, isEditing]);


    // FIX: Removed 'loading' from the dependency array of this useEffect
    useEffect(() => {
        if (isEditing && !loading && !authLoading && currentUser) {
            const fetchGigForEdit = async () => {
                setLoading(true);
                setError(null);
                try {
                    const response = await fetch(`http://localhost:5000/api/gigs/${gigId}`);
                    if (!response.ok) {
                        if (response.status === 404) {
                            console.log("FetchGigForEdit: Gig not found. Redirecting to /my-gigs.");
                            navigate('/my-gigs');
                            return;
                        }
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();

                    if (currentUser.uid !== data.userId) {
                        console.log("FetchGigForEdit: Not gig owner. Redirecting to /my-gigs.");
                        setError("You are not authorized to edit this gig.");
                        setLoading(false);
                        navigate('/my-gigs');
                        return;
                    }

                    setTitle(data.title || '');
                    setDescription(data.description || '');
                    setCategory(data.category || '');
                    setSubCategory(data.subCategory || '');
                    setPrice(data.price?.toString() || '');
                    setDeliveryTime(data.deliveryTime?.toString() || '');
                    setRevisions(data.revisions?.toString() || '');
                    setImages(data.images || []);
                    setGigOwnerId(data.userId);

                } catch (err) {
                    console.error("Error fetching gig for edit:", err);
                    setError(err.message || "Failed to load gig for editing.");
                    navigate('/my-gigs');
                } finally {
                    setLoading(false);
                }
            };
            fetchGigForEdit();
        } // OLD: 'loading' was here
    }, [gigId, isEditing, authLoading, currentUser, navigate]); // FIX: 'loading' removed from dependencies


    const handleImageAdd = () => { /* ... */ };
    const handleImageRemove = () => { /* ... */ };
    const handleSubmit = async (e) => { /* ... */ };

    // Conditional returns based on loading and authorization
    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">Loading user permissions...</div>;
    }

    if (!currentUser || userRole !== 'freelancer') {
        return null;
    }
    if (isEditing && loading) { // This 'loading' is fine as it's for this specific fetch's UI
        return <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">Loading gig data for editing...</div>;
    }
    if (!isEditing && loading) {
      return <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">Creating gig...</div>;
    }


    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                    {isEditing ? 'Edit Your Gig' : 'Create Your New Gig'}
                </h2>

                {error && <p className="p-3 text-sm text-red-700 bg-red-100 rounded-lg mb-4 text-center">{error}</p>}
                {successMessage && <p className="p-3 text-sm text-green-600 bg-green-100 rounded-lg mb-4 text-center">{successMessage}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Gig Title</label>
                        <input
                            type="text"
                            id="title"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="I will create an amazing website design"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Gig Description</label>
                        <textarea
                            id="description"
                            rows="5"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Describe your service in detail..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    {/* Category & Sub-Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">Category</label>
                            <select
                                id="category"
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                            >
                                <option value="">Select a Category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="subCategory" className="block text-gray-700 text-sm font-bold mb-2">Sub-Category (Optional)</label>
                            <input
                                type="text"
                                id="subCategory"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={subCategory}
                                onChange={(e) => setSubCategory(e.target.value)}
                                placeholder="e.g., UI/UX Design"
                            />
                        </div>
                    </div>

                    {/* Price, Delivery Time, Revisions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="price" className="block text-gray-700 text-sm font-bold mb-2">Price ($)</label>
                            <input
                                type="number"
                                id="price"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="e.g., 50"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                min="0"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="deliveryTime" className="block text-gray-700 text-sm font-bold mb-2">Delivery Time (Days)</label>
                            <input
                                type="number"
                                id="deliveryTime"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="e.g., 3"
                                value={deliveryTime}
                                onChange={(e) => setDeliveryTime(e.target.value)}
                                min="1"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="revisions" className="block text-gray-700 text-sm font-bold mb-2">Revisions</label>
                            <input
                                type="number"
                                id="revisions"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="e.g., 2 (or -1 for unlimited)"
                                value={revisions}
                                onChange={(e) => setRevisions(e.target.value)}
                                min="-1"
                                required
                            />
                        </div>
                    </div>

                    {/* Images Section */}
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Gig Images (URLs)</label>
                        <div className="flex space-x-2 mb-2">
                            <input
                                type="url"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="Enter image URL"
                                value={imageUrlInput}
                                onChange={(e) => setImageUrlInput(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={handleImageAdd}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md text-sm"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {images.map((img, index) => (
                                <div key={index} className="relative">
                                    <img src={img} alt={`Gig Image ${index}`} className="w-24 h-16 object-cover rounded-md border border-gray-300" />
                                    <button
                                        type="button"
                                        onClick={() => handleImageRemove(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Add URLs for images to showcase your gig. At least one is required.</p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg focus:outline-none focus:shadow-outline w-full transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? (isEditing ? 'Updating Gig...' : 'Creating Gig...') : (isEditing ? 'Update Gig' : 'Create Gig')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateGig;