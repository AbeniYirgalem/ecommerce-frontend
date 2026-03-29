import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import ProductGrid from "../components/product/ProductGrid";
import GlobalSpinner from "../components/ui/GlobalSpinner";
import api from "../redux/api/uniBazzarApi"; // Axios instance with CORS + auth configured

const API_BASE = `/api/products`;

const MarketplacePage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get("category");

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    pageSize: 12,
    pages: 1,
  });

  const dispatch = useDispatch();

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    setError(null);
    setSearchError(null);
    try {
      const { data } = await api.get(API_BASE, {
        params: {
          pageNumber: page,
          category: selectedCategory || undefined,
        },
      });
      setProducts(Array.isArray(data.products) ? data.products : []);
      setPagination({
        count: data.total || 0,
        next: data.page < data.pages ? data.page + 1 : null,
        previous: data.page > 1 ? data.page - 1 : null,
        currentPage: data.page || 1,
        pageSize: data.pageSize || 12,
        pages: data.pages || 1,
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedCategory(categoryParam || "");
    fetchProducts(1);
    // eslint-disable-next-line
  }, [categoryParam]);

  // Debounced search
  useEffect(() => {
    const term = keyword.trim();
    if (!term) {
      setSearchResults([]);
      setSearchError(null);
      setSearching(false);
      return;
    }

    setSearching(true);
    setSearchError(null);
    const controller = new AbortController();
    const handle = setTimeout(async () => {
      try {
        const res = await api.get(`${API_BASE}/search`, {
          params: { keyword: term, category: selectedCategory || undefined },
          signal: controller.signal,
        });
        setSearchResults(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (controller.signal.aborted) return;
        setSearchError(err.response?.data?.message || err.message);
        setSearchResults([]);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(handle);
    };
  }, [keyword, selectedCategory]);

  // Filter products based on search keyword and selected category, then randomize order
  useEffect(() => {
    const baseProducts = keyword.trim() ? searchResults : products;

    // Randomize the order of products when not searching to keep UI fresh
    const randomized = keyword.trim()
      ? baseProducts
      : baseProducts.slice().sort(() => Math.random() - 0.5);

    setFilteredProducts(randomized);
  }, [products, keyword, searchResults]);

  // Handle add to cart (no toast)
  const handleAddToCart = (product) => {
    dispatch(addToCart({ ...product, price: Number(product.price) }));
  };

  // Handle error clear
  const clearError = () => setError(null);

  const handlePageChange = (page) => {
    fetchProducts(page);
  };

  if (loading) {
    return <GlobalSpinner message="Loading marketplace products..." />;
  }

  return (
    <div className="space-y-6 pt-10 m-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Marketplace</h1>
        {/* Removed duplicated Tabs category navigation */}
      </div>
      <div className="flex justify-center">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-2/3 md:w-1/2">
          <input
            type="text"
            placeholder="Search products by title, description, or tags..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searching && (
            <span className="text-sm text-gray-500 dark:text-gray-300">
              Searching...
            </span>
          )}
          {keyword &&
            !searching &&
            searchResults.length === 0 &&
            !searchError && (
              <span className="text-sm text-gray-500 dark:text-gray-300">
                No results found
              </span>
            )}
          {searchError && (
            <span className="text-sm text-red-600 dark:text-red-400">
              {searchError}
            </span>
          )}
        </div>
      </div>
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 mb-6 rounded shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex text-red-700 dark:text-red-200">
              <span className="font-semibold block sm:inline mr-2">Error:</span>
              <span className="block sm:inline">{error}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadAllData}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-1.5 px-3 rounded transition-colors text-sm shadow-sm flex items-center gap-1 cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  ></path>
                </svg>
                Retry Request
              </button>
              <button
                className="text-sm underline text-red-600 dark:text-red-300 hover:text-red-800 dark:hover:text-red-100 cursor-pointer"
                onClick={clearError}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      <ProductGrid
        products={filteredProducts}
        loading={loading}
        error={error}
        onAddToCart={handleAddToCart}
        onClearError={clearError}
        paginationProps={{
          count: pagination.count,
          next: pagination.next,
          previous: pagination.previous,
          onPageChange: handlePageChange,
          currentPage: pagination.currentPage,
          pageSize: pagination.pageSize,
        }}
      />
    </div>
  );
};

export default MarketplacePage;
