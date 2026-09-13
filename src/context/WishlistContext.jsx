import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext(null);
const KEY = 'shopease_wishlist';

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) setWishlist(JSON.parse(raw));
  }, []);

  const save = (list) => {
    setWishlist(list);
    localStorage.setItem(KEY, JSON.stringify(list));
  };

  const addToWishlist = (product) => {
    if (!wishlist.find((p) => p._id === product._id)) {
      save([...wishlist, product]);
    }
  };

  const removeFromWishlist = (productId) => {
    save(wishlist.filter((p) => p._id !== productId));
  };

  const toggleWishlist = (product) => {
    if (wishlist.find((p) => p._id === product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const isWishlisted = (productId) => wishlist.some((p) => p._id === productId);

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, toggleWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
