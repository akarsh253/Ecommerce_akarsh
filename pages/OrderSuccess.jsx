import { Link, useParams } from "react-router";

export default function OrderSuccess() {
  const { id } = useParams();

  return (
    <div className="mx-auto max-w-xl rounded-lg bg-white p-8 text-center shadow-sm">
      <h1 className="text-3xl font-bold text-green-600">Order placed</h1>
      <p className="mt-4">
        Your order ID is <span className="font-semibold">{id}</span>
      </p>
      <p className="mt-1 text-sm text-slate-500">Pay with cash when it arrives.</p>

      <div className="mt-6 flex justify-center gap-3">
        <Link to="/orders" className="rounded border border-slate-300 px-5 py-2 hover:bg-slate-100">
          View my orders
        </Link>
        <Link to="/" className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
