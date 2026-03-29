import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api from "../lib/axios";
import { addToCart } from "../redux/slices/cartSlice";
import { FiShoppingCart, FiArrowLeft, FiPhone } from "react-icons/fi";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [editingReview, setEditingReview] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const dispatch = useDispatch();
  const {
    user,
    token,
    isAuthenticated,
    loading: authLoading,
  } = useSelector((state) => state.auth);

  // Generate a random views count for demo purposes
  const [views] = useState(() => Math.floor(Math.random() * 900 + 100));

  const FALLBACK_IMAGE = "https://via.placeholder.com/300";

  const getSellerEmail = () => {
    if (!product) return "";
    return product.seller?.email || product.createdBy?.email || "";
  };

  const getSellerName = () => {
    if (!product) return "";
    return (
      product.seller?.name ||
      product.createdBy?.name ||
      product.sellerName ||
      ""
    );
  };

  const getPhoneNumber = () => {
    if (!product) return "";
    return (
      product.phoneNumber ||
      product.phone_number ||
      product.phone ||
      product.contactNumber ||
      ""
    );
  };

  const getCategory = () => {
    if (!product) return "";
    if (typeof product.category === "string") return product.category;
    return product.category?.name || product.category?.title || "";
  };

  const getImage = () => {
    if (!product) return "";

    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }

    if (product.banner_photo) return product.banner_photo;

    if (Array.isArray(product.imageUrl) && product.imageUrl.length > 0) {
      return product.imageUrl[0];
    }

    if (product.imageUrl) return product.imageUrl;
    if (product.photo) return product.photo;
    if (product.image) return product.image;

    return FALLBACK_IMAGE;
  };

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !token) {
      setReviewError("Please log in to write a review");
      return;
    }

    const currentUserId = user?._id || user?.id;
    const existingReview = product?.reviews?.find((rev) => {
      const reviewUserId =
        rev.user?._id || rev.user?.id || rev.user || rev.createdBy?.id;
      return reviewUserId === currentUserId;
    });

    setReviewLoading(true);
    setReviewError("");
    try {
      const payload = { rating, comment };
      const { data } = existingReview
        ? await api.put(`/api/products/${id}/reviews`, payload)
        : await api.post(`/api/products/${id}/reviews`, payload);

      // Update local state to reflect add/update instantly
      setProduct((prevProduct) => {
        const reviews = prevProduct?.reviews ? [...prevProduct.reviews] : [];
        if (existingReview) {
          const nextReviews = reviews.map((rev) => {
            const reviewUserId =
              rev.user?._id || rev.user?.id || rev.user || rev.createdBy?.id;
            return reviewUserId === currentUserId ? data.review : rev;
          });
          return { ...prevProduct, reviews: nextReviews };
        }
        return { ...prevProduct, reviews: [...reviews, data.review] };
      });

      setComment("");
      setRating(5);
      setEditingReview(false);
    } catch (err) {
      setReviewError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message,
      );
    } finally {
      setReviewLoading(false);
    }
  };

  const deleteReviewHandler = async () => {
    if (!isAuthenticated || !token || !userReview) return;

    setDeleteLoading(true);
    setReviewError("");
    try {
      const reviewId = userReview._id || userReview.id || userReview.user;
      await api.delete(`/api/products/reviews/${reviewId}`);

      setProduct((prevProduct) => {
        const filteredReviews =
          prevProduct?.reviews?.filter((rev) => {
            const revId = rev._id || rev.id || rev.user;
            return revId !== reviewId;
          }) || [];
        return { ...prevProduct, reviews: filteredReviews };
      });

      setEditingReview(false);
      setRating(5);
      setComment("");
    } catch (err) {
      setReviewError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message,
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/api/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        const message =
          err.response?.data?.message ||
          err.response?.data?.detail ||
          err.message;
        setError(message || "Product not found");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      console.log("Product detail data", product);
    }
  }, [product]);

  useEffect(() => {
    console.log("Auth state (ProductDetail)", { isAuthenticated, user, token });
  }, [isAuthenticated, user, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex justify-center items-center">
        <div className="flex flex-col items-center bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-900/60 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-white">
          <svg
            className="animate-spin h-10 w-10 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-4 text-gray-700 dark:text-gray-300 text-lg font-inter">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-red-500 dark:text-red-400">
        <p className="mb-4 text-lg font-semibold">{error}</p>
        <Link
          to="/listings"
          className="text-blue-600 dark:text-blue-400 underline cursor-pointer"
        >
          Back to Listings
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <p className="text-xl">Loading product...</p>
      </div>
    );
  }

  // Tutor service: use banner_photo and description
  const isTutor =
    product.category &&
    (product.category.name === "tutoring" ||
      product.category.slug === "tutoring");
  const imageUrl = isTutor ? product.banner_photo || getImage() : getImage();
  const displayName = isTutor
    ? product.title || product.description
    : product.name || product.title;

  const currentUserId = user?._id || user?.id;
  const userReview = product.reviews?.find((rev) => {
    const reviewUserId =
      rev.user?._id || rev.user?.id || rev.user || rev.createdBy?.id;
    return reviewUserId === currentUserId;
  });
  const otherReviews =
    product.reviews?.filter((rev) => {
      const reviewUserId =
        rev.user?._id || rev.user?.id || rev.user || rev.createdBy?.id;
      return reviewUserId !== currentUserId;
    }) || [];
  const hasAnyReviews = (product.reviews?.length || 0) > 0;

  return (
    <section className="pt-24 py-12 px-4 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-[80vh]">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-blue-100 dark:border-blue-900 relative">
        <div className="md:w-1/2 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-900 dark:to-gray-800 p-8">
          <img
            src={imageUrl}
            alt={displayName}
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
            className="rounded-2xl w-full max-h-96 object-contain shadow-xl border-4 border-blue-100 dark:border-blue-700 bg-white dark:bg-gray-900"
          />
        </div>
        <div className="md:w-1/2 p-10 flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="mb-2">
                  <span
                    className="block mb-1 flex items-center gap-1 text-[11px] bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-semibold shadow animate-pulse-glow overflow-hidden w-fit"
                    style={{ minWidth: "60px" }}
                  >
                    <svg
                      className="w-3.5 h-3.5 text-green-500 drop-shadow-glow animate-glow-wave"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 3C5 3 1.73 7.11 1.13 8c-.15.22-.15.52 0 .74C1.73 10.89 5 15 10 15s8.27-4.11 8.87-5c.15-.22.15-.52 0-.74C18.27 7.11 15 3 10 3zm0 10c-3.31 0-6.31-2.53-7.44-4C3.69 7.53 6.69 5 10 5s6.31 2.53 7.44 4C16.31 10.47 13.31 13 10 13zm0-6a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                    {views} views
                  </span>
                  <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {displayName}
                  </h2>
                </div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg leading-relaxed">
              {product.description}
            </p>
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              {getCategory() && (
                <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-3 py-1 rounded-full font-medium">
                  Category: {getCategory()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-6 mb-6">
              <span className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {product.price} ETB
              </span>
            </div>
            {(getSellerName() || getSellerEmail() || getPhoneNumber()) && (
              <div className="mt-2 bg-gray-900/50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-700 dark:text-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Contact Seller
                </h3>
                {getSellerName() && (
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">
                      Name:
                    </strong>{" "}
                    {getSellerName()}
                  </p>
                )}
                {getSellerEmail() && (
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">
                      Email:
                    </strong>{" "}
                    {getSellerEmail()}
                  </p>
                )}
                {getPhoneNumber() && (
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">
                      Phone:
                    </strong>{" "}
                    {getPhoneNumber()}
                  </p>
                )}
              </div>
            )}
            {product.nearest_university && (
              <div className="mb-2 text-sm text-blue-700 dark:text-blue-300 font-medium">
                Nearest University: {product.nearest_university}
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <button
              className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-bold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer text-base flex items-center gap-2"
              onClick={() =>
                dispatch(
                  addToCart({
                    id: product.id,
                    title: product.name,
                    price: product.price,
                    imageUrl: getImage(),
                  }),
                )
              }
            >
              <FiShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
            {getSellerEmail() && (
              <a
                href={`mailto:${getSellerEmail()}`}
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer text-base flex items-center gap-2"
              >
                <FiPhone className="w-5 h-5" />
                Email Seller
              </a>
            )}
            <Link
              to="/listings"
              className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer text-base shadow flex items-center gap-2"
            >
              <FiArrowLeft className="w-5 h-5" />
              Back to Listings
            </Link>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto mt-12 mb-12">
        <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">
          Reviews
        </h3>
        {otherReviews.length > 0 ? (
          <div className="space-y-4">
            {otherReviews.map((review) => (
              <div
                key={review._id || review.id || review.user || Math.random()}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {review.user?.name || review.userName || "User"}
                  </span>
                  <span className="text-yellow-400 font-bold">
                    &#9733; {review.rating}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic">
                  "{review.comment}"
                </p>
              </div>
            ))}
          </div>
        ) : null}
        {otherReviews.length === 0 && !userReview && (
          <p className="text-gray-500 dark:text-gray-400 text-lg bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-center">
            No reviews yet. Be the first to leave a review!
          </p>
        )}

        {authLoading ? (
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl text-center">
            Loading your session...
          </div>
        ) : isAuthenticated && user ? (
          <div className="mt-8 bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                {userReview ? "Your Review" : "Write a Review"}
              </h4>
              {userReview && !editingReview && (
                <div className="flex items-center gap-3">
                  <button
                    className="text-blue-600 dark:text-blue-300 font-semibold text-sm hover:underline"
                    onClick={() => {
                      setRating(Number(userReview.rating) || 5);
                      setComment(userReview.comment || "");
                      setEditingReview(true);
                    }}
                  >
                    Edit review
                  </button>
                  <button
                    className="text-red-600 dark:text-red-400 font-semibold text-sm hover:underline disabled:opacity-60"
                    onClick={deleteReviewHandler}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              )}
            </div>

            {reviewError && (
              <p className="text-red-500 text-sm">{reviewError}</p>
            )}

            {userReview && !editingReview ? (
              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-400 font-bold">
                    &#9733; {userReview.rating}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Your submitted review
                  </span>
                </div>
                <p className="text-gray-800 dark:text-gray-200 italic">
                  "{userReview.comment}"
                </p>
              </div>
            ) : (
              <form
                onSubmit={submitReviewHandler}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rating
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Good</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Comment
                  </label>
                  <textarea
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-400"
                    placeholder="Share your experience with this product..."
                  ></textarea>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors disabled:opacity-50"
                  >
                    {reviewLoading
                      ? "Submitting..."
                      : userReview
                        ? "Update Review"
                        : "Submit Review"}
                  </button>
                  {userReview && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingReview(false);
                        setRating(5);
                        setComment("");
                        setReviewError("");
                      }}
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-xl text-center">
            Please{" "}
            <Link to="/login" className="font-bold underline">
              sign in
            </Link>{" "}
            to write a review.
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductDetail;
