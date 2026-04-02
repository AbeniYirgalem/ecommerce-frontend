import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import productService from "../../services/product.service";

/**
 * Product card component
 * @param {Object} props - Component props
 * @param {Object} props.product - Product data
 * @param {Function} props.onAddToCart - Function to call when adding to cart
 * @param {string} props.uniqueKey - Unique key for the product card
 */
const ProductCard = ({ product, onAddToCart, uniqueKey }) => {
  if (!product) return null;

  // Use product.category as string or object
  const categoryLabel =
    typeof product.category === "object" && product.category?.name
      ? product.category.name
      : product.category || "";

  const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const fallbackImage =
    "https://via.placeholder.com/400x300?text=No+Image+Available";

  // Helper function to get valid image URL
  function getValidImageUrl(url) {
    if (!url) return fallbackImage;
    if (
      url.startsWith("http") ||
      url.startsWith("https") ||
      url.startsWith("https%3A")
    ) {
      return decodeURIComponent(url);
    }
    // Prevent double slashes and correct missing /uploads/ vs /media/ if applicable
    const formattedUrl = url.startsWith("/") ? url : `/${url}`;
    return `${BACKEND_URL}${formattedUrl}`;
  }

  const initialImageUrl = getValidImageUrl(
    product.imageUrl ||
      product.image ||
      product.photo ||
      (product.images && product.images[0]),
  );
  const displayName =
    product.name || product.title || product.description || "Untitled";

  const [imgSrc, setImgSrc] = useState(initialImageUrl);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const userId = user?._id || user?.id;
  const [favoriteCount, setFavoriteCount] = useState(
    Number(product.favoritesCount || 0),
  );
  const [isFavorite, setIsFavorite] = useState(() => {
    if (!userId) return false;
    const favorites = Array.isArray(product.favorites) ? product.favorites : [];
    return favorites.some((favoriteId) => favoriteId === userId);
  });
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // Update state if product prop changes dynamically
  useEffect(() => {
    setImgSrc(initialImageUrl);
  }, [initialImageUrl]);

  useEffect(() => {
    const favorites = Array.isArray(product.favorites) ? product.favorites : [];
    setIsFavorite(userId ? favorites.includes(userId) : false);
    setFavoriteCount(Number(product.favoritesCount || favorites.length || 0));
  }, [product, userId]);

  // Get rating and price safely
  const rating = product.rating || 0;
  const price = Number(product.price) || 0;

  async function handleAddToCartWithFetch(productId, dispatch, onAddToCart) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/products/${productId}`);
      if (!res.ok) throw new Error("Product not found");
      const product = await res.json();
      dispatch({
        type: "cart/addToCart",
        payload: {
          id: product.id,
          title: product.name,
          price: product.price,
          imageUrl: product.photo || product.image,
        },
      });
      if (onAddToCart) onAddToCart(product);
      toast(
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img
            src={product.photo || product.image}
            alt={product.name}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              objectFit: "cover",
            }}
          />
          <span style={{ fontWeight: 500 }}>{product.name} added to cart!</span>
        </div>,
      );
    } catch (err) {
      toast.error("Failed to add product to cart.");
    }
  }

  const handleToggleFavorite = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to favorite products.");
      return;
    }

    if (isTogglingFavorite) return;
    setIsTogglingFavorite(true);

    try {
      const { data } = await productService.toggleFavorite(
        product.id || product._id,
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
    <div key={uniqueKey} className="group">
      <div className="relative overflow-hidden rounded-xl aspect-square mb-4 bg-white dark:bg-gray-800 flex items-center justify-center">
        {product.isNew && (
          <span className="absolute top-3 left-3 z-10 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded">
            New
          </span>
        )}
        {isAuthenticated && (
          <button
            className="absolute top-3 right-3 z-10 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:text-red-500 p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-300 cursor-pointer"
            type="button"
            onClick={handleToggleFavorite}
            aria-label="Toggle favorite"
          >
            <Heart
              size={18}
              className={isFavorite ? "fill-red-500 text-red-500" : ""}
            />
          </button>
        )}
        <Link to={`/products/${product.id}`}>
          <img
            src={imgSrc}
            alt={displayName}
            className="w-full h-full object-cover rounded-lg border-4 border-blue-100 dark:border-gray-700 shadow-lg mx-auto transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgSrc(fallbackImage)}
          />
        </Link>
        <div className="absolute inset-x-0 bottom-0 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 py-3 px-4 opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <button
            className="w-full flex items-center justify-center space-x-2 bg-gray-900 dark:bg-blue-700 hover:bg-black dark:hover:bg-blue-800 text-white py-2 rounded-lg font-medium transition-colors cursor-pointer group-hover:cursor-pointer"
            onClick={() =>
              handleAddToCartWithFetch(
                product.id,
                window.store?.dispatch || (() => {}),
                onAddToCart,
              )
            }
          >
            <ShoppingBag size={18} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
      <div className="text-center">
        <span className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">
          {categoryLabel}
        </span>
        <h3 className="font-medium text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <Link to={`/products/${product.id}`}>{displayName}</Link>
        </h3>
        <div className="flex items-center justify-center gap-2 mb-1">
          <Star size={16} className="text-yellow-400 fill-current" />
          <span className="text-sm text-gray-700 dark:text-gray-200">
            {rating}
          </span>
        </div>
        {favoriteCount > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400 block">
            {favoriteCount} favorites
          </span>
        )}
        <span className="font-semibold text-gray-900 dark:text-white">
          {isNaN(price) ? product.price : price.toFixed(2)} ETB
        </span>
      </div>
    </div>
  );
};

export default ProductCard;
