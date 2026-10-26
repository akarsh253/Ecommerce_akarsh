import { useEffect, useState } from "react";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import { getErrorMessage } from "../utils/format.js";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/products/categories")
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  // Wait briefly after typing stops so we don't call the API on every keystroke
  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(() => {
      setLoading(true);
      api
        .get("/products", { params: { search, category } })
        .then((res) => {
          if (ignore) return;
          setProducts(res.data);
          setError("");
        })
        .catch((err) => {
          if (!ignore) setError(getErrorMessage(err, "Could not load products."));
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }, 300);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [search, category]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm md:flex-row">
        <input
          type="text"
          placeholder="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 md:w-1/2"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 md:w-1/4"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      {loading ? (
        <p className="text-slate-500">Loading products...</p>
      ) : products.length === 0 && !error ? (
        <p className="text-slate-500">No products match your search.</p>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
