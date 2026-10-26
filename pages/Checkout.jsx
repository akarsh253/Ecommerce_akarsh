import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import api from "../api/axios.js";
import { useCart } from "../context/hooks.js";
import { formatPrice, getErrorMessage } from "../utils/format.js";

const EMPTY_FORM = {
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
};

const LABELS = {
  fullName: "Full name",
  phone: "Phone number",
  addressLine: "Address",
  city: "City",
  state: "State",
  pincode: "Pincode",
};

const inputClass =
  "w-full rounded border border-slate-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, refreshCart } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    let ignore = false;
    api
      .get("/address")
      .then((res) => {
        if (ignore) return;
        setAddresses(res.data);
        setSelectedId(res.data[0]?._id ?? "");
        setShowForm(res.data.length === 0);
      })
      .catch((err) => {
        if (!ignore) setError(getErrorMessage(err, "Could not load your addresses."));
      })
      .finally(() => {
        if (!ignore) setLoadingAddresses(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const total = cart.items.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const saveAddress = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await api.post("/address", form);
      setAddresses((prev) => [res.data.address, ...prev]);
      setSelectedId(res.data.address._id);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const placeOrder = async () => {
    setError("");
    setPlacing(true);
    try {
      const res = await api.post("/orders", { addressId: selectedId });
      await refreshCart();
      navigate(`/order-success/${res.data.orderId}`, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
      setPlacing(false);
    }
  };

  if (cart.items.length === 0 && !placing) {
    return (
      <p className="text-slate-600">
        Your cart is empty.{" "}
        <Link to="/" className="text-blue-600 hover:underline">
          Browse products
        </Link>
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-2xl font-bold">Checkout</h1>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      <h2 className="mb-2 font-semibold">Delivery address</h2>

      {loadingAddresses ? (
        <p className="text-slate-500">Loading addresses...</p>
      ) : (
        <>
          <div className="space-y-3">
            {addresses.map((addr) => (
              <label
                key={addr._id}
                className="block cursor-pointer rounded border border-slate-200 bg-white p-3"
              >
                <input
                  type="radio"
                  name="address"
                  checked={selectedId === addr._id}
                  onChange={() => setSelectedId(addr._id)}
                  className="mr-2"
                />
                <strong>{addr.fullName}</strong>
                <p className="text-sm">
                  {addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}
                </p>
                <p className="text-sm">Phone: {addr.phone}</p>
              </label>
            ))}
          </div>

          {showForm ? (
            <form onSubmit={saveAddress} className="mt-4 space-y-3 rounded border border-slate-200 bg-white p-4">
              {Object.keys(EMPTY_FORM).map((key) => (
                <input
                  key={key}
                  name={key}
                  placeholder={LABELS[key]}
                  value={form[key]}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              ))}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-slate-400"
                >
                  {saving ? "Saving..." : "Save address"}
                </button>
                {addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded border border-slate-300 px-4 py-2 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-sm text-blue-600 hover:underline"
            >
              Add a new address
            </button>
          )}
        </>
      )}

      <h2 className="mb-2 mt-8 font-semibold">Order summary</h2>
      <div className="rounded border border-slate-200 bg-white p-4">
        {cart.items.map((item) => (
          <div key={item.productId._id} className="flex justify-between py-1 text-sm">
            <span>
              {item.productId.title} x {item.quantity}
            </span>
            <span>{formatPrice(item.productId.price * item.quantity)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t pt-2 text-lg font-bold">
          <span>Total (cash on delivery)</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <button
        onClick={placeOrder}
        disabled={!selectedId || placing}
        className="mt-6 w-full rounded bg-green-600 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {placing ? "Placing order..." : "Place order"}
      </button>
      {!selectedId && !loadingAddresses && (
        <p className="mt-2 text-sm text-slate-500">Add a delivery address to place your order.</p>
      )}
    </div>
  );
}
