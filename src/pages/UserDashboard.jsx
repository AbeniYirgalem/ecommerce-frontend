import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../lib/axios";
import productService from "../services/product.service";

function UserDashboard() {
  const [items, setItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", price: "" });
  const { user } = useSelector((state) => state.auth);
  const userId = user?._id || user?.id;

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [items],
  );

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/api/products/my");
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load your products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const { data } = await api.get(`/api/users/${userId}/favorites`);
        setFavorites(Array.isArray(data) ? data : []);
      } catch (err) {
        setFavorites([]);
      }
    };

    if (userId) {
      fetchFavorites();
    }
  }, [userId]);

  const startEdit = (item) => {
    setEditingId(item._id || item.id);
    setForm({
      title: item.title || "",
      description: item.description || "",
      price: item.price || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ title: "", description: "", price: "" });
  };

  const saveEdit = async (id) => {
    try {
      await productService.update(id, {
        title: form.title,
        description: form.description,
        price: Number(form.price),
      });
      await fetchMyProducts();
      cancelEdit();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update product.");
    }
  };

  const removeProduct = async (id) => {
    const confirmed = window.confirm("Delete this product permanently?");
    if (!confirmed) return;

    try {
      await productService.remove(id);
      setItems((prev) => prev.filter((item) => (item._id || item.id) !== id));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete product.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pt-24 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold">User Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your own posts/products in one place.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/create"
              className="inline-flex items-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium"
            >
              Create New product
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            Loading your PRODUCTS...
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            You have not created any PRODUCTS yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedItems.map((item) => {
              const id = item._id || item.id;
              const image =
                item.imageUrl ||
                item.images?.[0] ||
                "https://via.placeholder.com/800x600?text=No+Image";
              const isEditing = editingId === id;

              return (
                <article
                  key={id}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-sm"
                >
                  <img
                    src={image}
                    alt={item.title}
                    className="h-44 w-full object-cover"
                  />

                  <div className="p-4 space-y-3">
                    {isEditing ? (
                      <>
                        <input
                          value={form.title}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                          placeholder="Title"
                        />
                        <textarea
                          value={form.description}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                          rows={3}
                          placeholder="Description"
                        />
                        <input
                          type="number"
                          value={form.price}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              price: e.target.value,
                            }))
                          }
                          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                          placeholder="Price"
                        />
                      </>
                    ) : (
                      <>
                        <h2 className="text-lg font-semibold line-clamp-1">
                          {item.title}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {item.description}
                        </p>
                        <p className="font-bold text-blue-600 dark:text-blue-400">
                          {Number(item.price || 0).toLocaleString()} ETB
                        </p>
                      </>
                    )}

                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <Link
                        to={`/products/${id}`}
                        className="text-center rounded-md border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        View
                      </Link>

                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => saveEdit(id)}
                            className="rounded-md bg-blue-600 hover:bg-blue-700 text-white px-2 py-2 text-sm"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-2 py-2 text-sm"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="rounded-md bg-amber-500 hover:bg-amber-600 text-white px-2 py-2 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeProduct(id)}
                            className="rounded-md bg-red-600 hover:bg-red-700 text-white px-2 py-2 text-sm"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {favorites.length > 0 && (
        <div className="mt-12" id="favorites">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            My Favorites
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {favorites.map((favorite) => {
              const favId = favorite._id || favorite.id;
              const favImage =
                favorite.imageUrl ||
                favorite.images?.[0] ||
                "https://via.placeholder.com/800x600?text=No+Image";

              return (
                <article
                  key={favId}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-sm"
                >
                  <img
                    src={favImage}
                    alt={favorite.title}
                    className="h-44 w-full object-cover"
                  />
                  <div className="p-4 space-y-2">
                    <h3 className="text-lg font-semibold line-clamp-1">
                      {favorite.title}
                    </h3>
                    <p className="font-bold text-blue-600 dark:text-blue-400">
                      {Number(favorite.price || 0).toLocaleString()} ETB
                    </p>
                    <Link
                      to={`/products/${favId}`}
                      className="text-sm text-blue-600 dark:text-blue-300 hover:underline"
                    >
                      View Details
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
