import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import api from "../api/axios.js";
import { useAuth, useCart } from "../context/hooks.js";
import { formatPrice, getErrorMessage, PLACEHOLDER_IMAGE } from "../utils/format.js";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let ignore = false;
    api
      .get(`/products/${id}`)
      .then((res) => {
        if (!ignore) setProduct(res.data);
      })
      .catch((err) => {
        if (!ignore) setLoadError(getErrorMessage(err, "Could not load this product."));
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  const handleAdd = async () => {
    if (!token) {
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }
    setAdding(true);
    setNotice("");
    try {
      await addToCart(product._id);
      setNotice("Added to your cart.");
    } catch (err) {
      setNotice(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  if (loadError) return <p className="text-red-600">{loadError}</p>;
  if (!product) return <p className="text-slate-500">Loading...</p>;

  const outOfStock = product.stock <= 0;

  return (
    <div className="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow-sm">
      <img
        src={product.image || PLACEHOLDER_IMAGE}
        alt={product.title}
        onError={(e) => {
          e.currentTarget.src = PLACEHOLDER_IMAGE;
        }}
        className="h-72 w-full rounded object-contain"
      />
      <h1 className="mt-4 text-2xl font-bold">{product.title}</h1>
      {product.category && <p className="mt-1 text-sm text-slate-500">{product.category}</p>}
      <p className="mt-3 text-slate-700">{product.description}</p>
      <p className="mt-4 text-xl font-semibold">{formatPrice(product.price)}</p>
      <p className="mt-1 text-sm text-slate-500">
        {outOfStock ? "Out of stock" : `${product.stock} in stock`}
      </p>

      <button
        onClick={handleAdd}
        disabled={outOfStock || adding}
        className="mt-6 w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400 md:w-1/2"
      >
        {outOfStock ? "Out of stock" : "Add to cart"}
      </button>
      {notice && <p className="mt-3 text-sm text-slate-700">{notice}</p>}
    </div>
  );
}
