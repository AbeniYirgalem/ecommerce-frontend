import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

function ListingCard({ listing }) {
  const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const defaultImage = 'https://via.placeholder.com/400x300?text=No+Image+Available';
  
  // Safely extract image URL
  let initialImageUrl = defaultImage;
  
  if (listing.imageUrl) {
     initialImageUrl = listing.imageUrl;
  } else if (listing.images && listing.images.length > 0) {
     initialImageUrl = listing.images[0];
  }
  
  // Format local paths
  if (initialImageUrl.startsWith('/')) {
    initialImageUrl = `${BACKEND_URL}${initialImageUrl}`;
  }

  const [imgSrc, setImgSrc] = useState(initialImageUrl);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all">
      <img 
        src={imgSrc} 
        alt={listing.title || 'Listing Image'} 
        className="h-48 w-full object-cover"
        onError={() => setImgSrc(defaultImage)}
      />
      <div className="p-4">
        <h2 className="text-lg font-bold">{listing.title}</h2>
        <p className="text-gray-600 text-sm line-clamp-2">{listing.description}</p>

        <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
          <MapPin size={16} />
          <span>{listing.location}</span>
        </div>

        <div className="flex justify-between items-center mt-4">
          <span className="text-green-600 font-semibold">{listing.price} ETB</span>
          <Link to={`/listings/${listing.id}`}>
            <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
              View Details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ListingCard;
