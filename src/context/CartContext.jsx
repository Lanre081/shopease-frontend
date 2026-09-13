import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);
const CART_KEY = 'cart';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem(CART_KEY);
    if (raw) {
      setCart(JSON.parse(raw));
    }
  }, []);

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem(CART_KEY, JSON.stringify(newCart));
  };

  const addToCart = (product, quantity = 1, variant = "") => {
    const newCart = [...cart];
    const existing = newCart.find(item => item.productId === product._id && item.variant === variant);

    if (existing) {
      existing.quantity += quantity;
    } else {
      newCart.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: (product.images && product.images.length > 0) ? product.images[0] : product.image || "https://via.placeholder.com/300",
        quantity,
        variant
      });
    }
    saveCart(newCart);
  };

  const updateQuantity = (productId, variant, quantity) => {
    let newCart = [...cart];
    if (quantity <= 0) {
      newCart = newCart.filter(item => !(item.productId === productId && item.variant === variant));
    } else {
      const item = newCart.find(i => i.productId === productId && i.variant === variant);
      if (item) item.quantity = quantity;
    }
    saveCart(newCart);
  };

  const removeFromCart = (productId, variant) => {
    const newCart = cart.filter(item => !(item.productId === productId && item.variant === variant));
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
