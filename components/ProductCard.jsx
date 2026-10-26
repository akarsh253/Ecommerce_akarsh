import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth, useCart } from "../context/hooks.js";
import { formatPrice, getErrorMessage, PLACEHOLDER_IMAGE } from "../utils/format.js";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { addToCart } = useCart();
  const [status, setStatus] = useState("idle"); // idle | adding | added
  const [error, setError] = useState("");

  const outOfStock = product.stock <= 0;

  const handleAdd = async () => {
    if (!token) {
      navigate("/login", { state: { from: "/" } });
      return;
    }
    setError("");
    setStatus("adding");
    try {
      await addToCart(product._id);
      setStatus("added");
      setTimeout(() => setStatus("idle"), 1200);
    } catch (err) {
      setStatus("idle");
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <Link to={`/product/${product._id}`}>
        <img
          src={product.image || PLACEHOLDER_IMAGE}
          alt={product.title}
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_IMAGE;
          }}
          className="h-40 w-full rounded object-contain"
        />
        <h2 className="mt-2 line-clamp-2 font-semibold">{product.title}</h2>
      </Link>

      <div className="mt-auto flex items-center justify-between pt-3">
        <p className="font-semibold text-slate-700">{formatPrice(product.price)}</p>
        <button
          onClick={handleAdd}
          disabled={outOfStock || status === "adding"}
          className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {outOfStock ? "Out of stock" : status === "added" ? "Added" : "Add to cart"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
