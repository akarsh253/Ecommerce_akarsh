import { Link, useNavigate } from "react-router";
import { useAuth, useCart } from "../context/hooks.js";

export default function Navbar() {
  const navigate = useNavigate();
  const { token, user, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-slate-900 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold">
          Akarsh Store
        </Link>

        <div className="flex items-center gap-5 text-sm">
          {isAdmin && (
            <Link to="/admin/products" className="hover:underline">
              Manage products
            </Link>
          )}
          {token && (
            <Link to="/orders" className="hover:underline">
              My orders
            </Link>
          )}
          <Link to="/cart" className="relative text-xl" aria-label="Cart">
            🛒
            {cartCount > 0 && (
              <span className="absolute -right-3 -top-2 rounded-full bg-red-600 px-1.5 text-xs">
                {cartCount}
              </span>
            )}
          </Link>

          {token ? (
            <>
              <span className="hidden text-slate-300 sm:inline">Hi, {user?.name}</span>
              <button onClick={handleLogout} className="hover:underline">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">
                Log in
              </Link>
              <Link to="/signup" className="rounded bg-blue-600 px-3 py-1 hover:bg-blue-700">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
