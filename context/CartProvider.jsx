import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";
import { CartContext } from "./contexts.js";
import { useAuth } from "./hooks.js";

const EMPTY_CART = { items: [] };

export default function CartProvider({ children }) {
  const { token } = useAuth();
  const [cart, setCart] = useState(EMPTY_CART);

  // Load the cart whenever someone logs in; clear it when they log out
  useEffect(() => {
    if (!token) return undefined;
    let ignore = false;
    api
      .get("/cart")
      .then((res) => {
        if (!ignore) setCart(res.data);
      })
      .catch(() => {});
    return () => {
      ignore = true;
      setCart(EMPTY_CART);
    };
  }, [token]);

  const refreshCart = useCallback(async () => {
    const res = await api.get("/cart");
    setCart(res.data);
  }, []);

  const addToCart = useCallback(async (productId) => {
    const res = await api.post("/cart/add", { productId });
    setCart(res.data.cart);
  }, []);

  const updateQuantity = useCallback(async (productId, quantity) => {
    const res = await api.patch("/cart/update", { productId, quantity });
    setCart(res.data.cart);
  }, []);

  const removeItem = useCallback(async (productId) => {
    const res = await api.delete(`/cart/remove/${productId}`);
    setCart(res.data.cart);
  }, []);

  const value = useMemo(() => {
    const visible = token ? cart : EMPTY_CART;
    return {
      cart: visible,
      cartCount: visible.items.reduce((sum, item) => sum + item.quantity, 0),
      refreshCart,
      addToCart,
      updateQuantity,
      removeItem,
    };
  }, [token, cart, refreshCart, addToCart, updateQuantity, removeItem]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
