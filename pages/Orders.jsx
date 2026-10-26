import { useEffect, useState } from "react";
import { Link } from "react-router";
import api from "../api/axios.js";
import { formatPrice, getErrorMessage } from "../utils/format.js";

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    api
      .get("/orders")
      .then((res) => {
        if (!ignore) setOrders(res.data);
      })
      .catch((err) => {
        if (!ignore) setError(getErrorMessage(err, "Could not load your orders."));
      });
    return () => {
      ignore = true;
    };
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!orders) return <p className="text-slate-500">Loading...</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">My orders</h1>

      {orders.length === 0 ? (
        <p className="text-slate-600">
          You haven't placed any orders yet.{" "}
          <Link to="/" className="text-blue-600 hover:underline">
            Start shopping
          </Link>
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap justify-between gap-2 text-sm text-slate-600">
                <span>Order {order._id}</span>
                <span>{new Date(order.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
              <ul className="mt-3 space-y-1 text-sm">
                {order.items.map((item) => (
                  <li key={item._id} className="flex justify-between">
                    <span>
                      {item.title} x {item.quantity}
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between border-t pt-2 font-semibold">
                <span>{order.status}</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
