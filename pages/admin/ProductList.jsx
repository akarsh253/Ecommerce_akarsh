import { useEffect, useState } from "react";
import { Link } from "react-router";
import api from "../../api/axios.js";
import { formatPrice, getErrorMessage } from "../../utils/format.js";

export default function ProductList() {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    api
      .get("/products")
      .then((res) => {
        if (!ignore) setProducts(res.data);
      })
      .catch((err) => {
        if (!ignore) setError(getErrorMessage(err, "Could not load products."));
      });
    return () => {
      ignore = true;
    };
  }, []);

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.title}"?`)) return;
    setError("");
    try {
      await api.delete(`/products/${product._id}`);
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link to="/admin/products/add" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Add product
        </Link>
      </div>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      {!products ? (
        !error && <p className="text-slate-500">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-slate-600">No products yet. Add your first one.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-200 bg-white">
            <thead>
              <tr className="bg-slate-100 text-left">
                <th className="border border-slate-200 px-4 py-2">Title</th>
                <th className="border border-slate-200 px-4 py-2">Price</th>
                <th className="border border-slate-200 px-4 py-2">Stock</th>
                <th className="border border-slate-200 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="border border-slate-200 px-4 py-2">{product.title}</td>
                  <td className="border border-slate-200 px-4 py-2">{formatPrice(product.price)}</td>
                  <td className="border border-slate-200 px-4 py-2">{product.stock}</td>
                  <td className="border border-slate-200 px-4 py-2">
                    <Link
                      to={`/admin/products/edit/${product._id}`}
                      className="mr-4 text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(product)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
