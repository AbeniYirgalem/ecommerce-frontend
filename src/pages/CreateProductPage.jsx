import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; // Import useSelector
import api from "../redux/api/uniBazzarApi"; // Import the API client
import { PRODUCT_CATEGORIES } from "../constants/categories";

function CreateProductPage() {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth); // Get user and token

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "", // Changed from category_id to category
    description: "",
    phone_number: "",
    tags: "",
    condition: "new", // Default condition, relevant for students
    photo: null, // Added for photo upload
  });

  const [categories] = useState(PRODUCT_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setError(null);
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setFormData({ ...formData, photo: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");
    setLoading(true);

    if (!user || !token) {
      setError("You must be logged in to create a product.");
      setLoading(false);
      return;
    }

    if (!formData.category) {
      setError("Please select a category.");
      setLoading(false);
      return;
    }

    const selectedCategory = categories.find(
      (cat) => cat === formData.category,
    );

    if (!selectedCategory) {
      setError("Selected category is invalid. Please try again.");
      setLoading(false);
      return;
    }

    const data = new FormData();

    // Single endpoint for all authenticated users; backend enforces auth only
    const endpoint = "/api/products";

    // Title/name + optional metadata
    data.append("name", formData.name);
    data.append("tags", formData.tags || "");
    if (formData.condition) data.append("condition", formData.condition);

    // Common fields
    data.append("category", formData.category);
    data.append("description", formData.description);
    data.append("price", String(formData.price));
    if (formData.phone_number)
      data.append("phone_number", formData.phone_number);
    if (formData.photo) data.append("photo", formData.photo);

    try {
      const response = await api.post(endpoint, data);

      if (response.status === 201 || response.status === 200) {
        setSuccessMessage("product created successfully!");
        // Reset form or navigate
        setFormData({
          name: "",
          price: "",
          category: "",
          description: "",
          phone_number: "",
          tags: "",
          condition: "new",
          photo: null, // Reset photo field
        });
        // navigate("/products"); // Or to the new product's page
      } else {
        setError(
          response.data?.detail ||
            response.data?.message ||
            "Failed to create product.",
        );
      }
    } catch (err) {
      console.error("Submit product error:", err.response || err);
      let errorMessage = "Failed to create product. Please try again.";
      if (err.response && err.response.data) {
        const errors = err.response.data;

        if (Array.isArray(errors?.errors)) {
          errorMessage = errors.errors
            .map((entry) => {
              const field = Object.keys(entry || {})[0];
              const message = field ? entry[field] : null;
              return field && message ? `${field}: ${message}` : null;
            })
            .filter(Boolean)
            .join("; ");
        } else if (typeof errors === "object") {
          errorMessage = Object.entries(errors)
            .map(
              ([key, value]) =>
                `${key}: ${Array.isArray(value) ? value.join(", ") : value}`,
            )
            .join("; ");
        } else {
          errorMessage = errors.detail || errors.message || errorMessage;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-10 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg space-y-6 border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600 dark:text-blue-400">
          Create New product
        </h2>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-md">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="p-3 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 rounded-md">
            {successMessage}
          </div>
        )}

        {/* Name (Title) - Not for Tutors */}
        {user?.role !== "tutor" && (
          <div>
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Name / Title
            </label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder={
                user?.role === "student"
                  ? "e.g., Used Physics Textbook"
                  : "e.g., Graphic Design Services"
              }
              value={formData.name}
              onChange={handleChange}
              className="border p-3 w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              required={user?.role !== "tutor"}
            />
          </div>
        )}

        {/* Price */}
        <div>
          <label
            htmlFor="price"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Price (ETB)
          </label>
          <input
            type="number"
            name="price"
            id="price"
            placeholder="e.g., 300"
            value={formData.price}
            onChange={handleChange}
            className="border p-3 w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Category
          </label>
          <select
            name="category"
            id="category"
            value={formData.category}
            onChange={handleChange}
            className="border p-3 w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Description
          </label>
          <textarea
            name="description"
            id="description"
            placeholder={
              user?.role === "tutor"
                ? "Describe your tutoring service, subjects, availability..."
                : "Write a brief description..."
            }
            value={formData.description}
            onChange={handleChange}
            className="border p-3 w-full rounded-md h-32 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Phone Number */}
        <div>
          <label
            htmlFor="phone_number"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Phone Number
          </label>
          <input
            type="tel"
            name="phone_number"
            id="phone_number"
            placeholder="e.g., 0912345678"
            value={formData.phone_number}
            onChange={handleChange}
            className="border p-3 w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Tags - Not for Tutors */}
        {user?.role !== "tutor" && (
          <div>
            <label
              htmlFor="tags"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              id="tags"
              placeholder="e.g., physics, semester1, engineering"
              value={formData.tags}
              onChange={handleChange}
              className="border p-3 w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {/* Condition - Only for Students */}
        {user?.role === "student" && (
          <div>
            <label
              htmlFor="condition"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Condition
            </label>
            <select
              name="condition"
              id="condition"
              value={formData.condition}
              onChange={handleChange}
              className="border p-3 w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="new">New</option>
              <option value="used_like_new">Used - Like New</option>
              <option value="used_good">Used - Good</option>
              <option value="used_fair">Used - Fair</option>
            </select>
          </div>
        )}

        {/* Photo Upload - Field name "photo" based on error */}
        <div>
          <label
            htmlFor="photo"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Product Photo
          </label>
          <input
            type="file"
            name="photo"
            id="photo"
            accept="image/*"
            onChange={handleChange}
            className="border p-3 w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-700 file:text-blue-700 dark:file:text-blue-100 hover:file:bg-blue-100 dark:hover:file:bg-blue-600"
            // Making it required for merchant, optional for others for now
            required={user?.role === "merchant"}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold transition-colors duration-200 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 cursor-pointer"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Post product"}
        </button>
      </form>
    </div>
  );
}

export default CreateProductPage;
