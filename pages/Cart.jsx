import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useCart } from "../context/hooks.js";
import { formatPrice, getErrorMessage, PLACEHOLDER_IMAGE } from "../utils/format.js";

export default function Cart() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeItem } = useCart();
  const [error, setError] = useState("");

  const run = async (action) => {
    setError("");
    try {
      await action();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const total = cart.items.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold">Your cart</h1>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      {cart.items.length === 0 ? (
        <p className="text-slate-600">
          Your cart is empty.{" "}
          <Link to="/" className="text-blue-600 hover:underline">
            Browse products
          </Link>
        </p>
      ) : (
        <div className="space-y-4">
          {cart.items.map((item) => {
            const product = item.productId;
            return (
              <div
                key={product._id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={product.image || PLACEHOLDER_IMAGE}
                    alt={product.title}
                    onError={(e) => {
                      e.currentTarget.src = PLACEHOLDER_IMAGE;
                    }}
                    className="h-16 w-16 rounded object-cover"
                  />
                  <div>
                    <h2 className="font-semibold">{product.title}</h2>
                    <p className="text-slate-600">{formatPrice(product.price)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      run(() =>
                        item.quantity === 1
                          ? removeItem(product._id)
                          : updateQuantity(product._id, item.quantity - 1)
                      )
                    }
                    className="rounded bg-slate-200 px-3 py-1 hover:bg-slate-300"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => run(() => updateQuantity(product._id, item.quantity + 1))}
                    disabled={item.quantity >= product.stock}
                    className="rounded bg-slate-200 px-3 py-1 hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <p className="w-24 text-right font-semibold">
                  {formatPrice(product.price * item.quantity)}
                </p>

                <button
                  onClick={() => run(() => removeItem(product._id))}
                  className="text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            );
          })}

          <div className="text-right text-xl font-bold">Total: {formatPrice(total)}</div>
          <button
            onClick={() => navigate("/checkout")}
            className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
          >
            Continue to checkout
          </button>
        </div>
      )}
    </div>
  );
}
