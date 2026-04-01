import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Heart } from "lucide-react";
import { useSelector } from "react-redux";
import productService from "../services/product.service";
import toast from "react-hot-toast";

function ProductCard({ product }) {
  const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const defaultImage =
    "https://via.placeholder.com/400x300?text=No+Image+Available";
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const userId = user?._id || user?.id;
  const [favoriteCount, setFavoriteCount] = useState(
    Number(product?.favoritesCount || 0),
  );
  const [isFavorite, setIsFavorite] = useState(() => {
    if (!userId) return false;
    const favorites = Array.isArray(product?.favorites)
      ? product.favorites
      : [];
    return favorites.includes(userId);
  });
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // Safely extract image URL
  let initialImageUrl = defaultImage;

  if (product.imageUrl) {
    initialImageUrl = product.imageUrl;
  } else if (product.images && product.images.length > 0) {
    initialImageUrl = product.images[0];
  }

  // Format local paths
  if (initialImageUrl.startsWith("/")) {
    initialImageUrl = `${BACKEND_URL}${initialImageUrl}`;
  }

  const [imgSrc, setImgSrc] = useState(initialImageUrl);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to favorite products.");
      return;
    }

    if (isTogglingFavorite) return;
    setIsTogglingFavorite(true);

    try {
      const { data } = await productService.toggleFavorite(
        product._id || product.id,
      );
      const updatedProduct = data?.product || {};
      const favorites = Array.isArray(updatedProduct.favorites)
        ? updatedProduct.favorites
        : [];
      setIsFavorite(favorites.includes(userId));
      setFavoriteCount(
        Number(
          data?.favoritesCount ||
            updatedProduct.favoritesCount ||
            favorites.length ||
            0,
        ),
      );
    } catch (err) {
      toast.error("Failed to update favorite.");
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  return (
    <div className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all">
      <img
        src={imgSrc}
        alt={product.title || "product Image"}
        className="h-48 w-full object-cover"
        onError={() => setImgSrc(defaultImage)}
      />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{product.title}</h2>
          {isAuthenticated && (
            <button
              type="button"
              onClick={handleToggleFavorite}
              className="text-gray-500 hover:text-red-500 transition-opacity opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
              aria-label="Toggle favorite"
            >
              <Heart
                className={isFavorite ? "fill-red-500 text-red-500" : ""}
                size={18}
              />
            </button>
          )}
        </div>
        <p className="text-gray-600 text-sm line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
          <MapPin size={16} />
          <span>{product.location}</span>
        </div>

        <div className="flex justify-between items-center mt-4">
          <span className="text-green-600 font-semibold">
            {product.price} ETB
          </span>
          <Link to={`/products/${product.id}`}>
            <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
              View Details
            </button>
          </Link>
        </div>
        {favoriteCount > 0 && (
          <span className="mt-2 block text-xs text-gray-500">
            {favoriteCount} favorites
          </span>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
