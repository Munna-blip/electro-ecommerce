import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setSubtotal(0);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/cart");
      setItems(res.data.items);
      setSubtotal(res.data.subtotal);
    } catch (e) {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      await api.post("/cart", { product_id: productId, quantity });
      toast.success("Added to cart");
      await refreshCart();
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not add to cart");
      throw e;
    }
  };

  const updateQuantity = async (cartId, quantity) => {
    try {
      await api.put(`/cart/${cartId}`, { quantity });
      await refreshCart();
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not update quantity");
    }
  };

  const removeItem = async (cartId) => {
    await api.delete(`/cart/${cartId}`);
    await refreshCart();
  };

  const clearCart = async () => {
    await api.delete("/cart");
    await refreshCart();
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, subtotal, itemCount, loading, addToCart, updateQuantity, removeItem, clearCart, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
