import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { CardBody, CardContainer, CardItem } from "../components/ui/3d-card";
import { Link } from "react-router-dom";
import productService from "../services/product.service";

function SimilarItemsPage() {
  const { id } = useParams();
  const [similarItems, setSimilarItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSimilarItems = async () => {
      try {
        setLoading(true);
        setError("");

        const [{ data: selectedItem }, { data: productsPayload }] =
          await Promise.all([
            productService.getById(id),
            productService.getAll({ pageNumber: 1 }),
          ]);

        setCurrentItem(selectedItem);

        const products = Array.isArray(productsPayload?.products)
          ? productsPayload.products
          : [];

        const similar = products.filter(
          (item) =>
            item.category === selectedItem?.category &&
            item._id !== selectedItem?._id,
        );
        setSimilarItems(similar);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Failed to load similar products",
        );
        setCurrentItem(null);
        setSimilarItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarItems();
  }, [id]);

  if (loading)
    return (
      <div className="p-6 pt-16 text-gray-900 dark:text-white">Loading...</div>
    );

  if (error)
    return (
      <div className="p-6 pt-16 text-red-600 dark:text-red-400">{error}</div>
    );

  if (!currentItem)
    return (
      <div className="p-6 pt-16 text-gray-900 dark:text-white">
        Product not found.
      </div>
    );

  return (
    <div className="p-6 pt-16 text-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-4">
        Similar Items to: {currentItem.title}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {similarItems.map((item) => (
          <CardContainer
            key={item._id}
            className="group relative w-full max-w-sm mx-auto overflow-visible"
          >
            <CardBody className="relative bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg hover:shadow-xl transition duration-300 flex flex-col overflow-visible">
              <CardItem>
                <img
                  src={item.imageUrl || item.images?.[0] || ""}
                  alt={item.title}
                  className="h-48 w-full object-cover rounded mb-4"
                />
              </CardItem>
              <CardItem>
                <h2 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1 mb-1">
                  {item.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {item.category}
                </p>
                <p className="text-blue-600 font-bold text-lg mb-4">
                  ${item.price}
                </p>
              </CardItem>
              <Link
                to={`/products/${item._id}`}
                className="bg-black dark:bg-blue-600 text-white px-3 py-2 rounded text-sm text-center hover:opacity-90 transition"
              >
                View Details
              </Link>
            </CardBody>
          </CardContainer>
        ))}
      </div>
    </div>
  );
}

export default SimilarItemsPage;
