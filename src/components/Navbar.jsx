import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { api } from '../services/api';
import {
  ShoppingCart, Heart, User, LogOut, Menu, X, Search,
  ChevronDown, Package, LayoutDashboard, Smartphone, Laptop,
  Shirt, Home, Zap, Baby, ShoppingBag, Tv, Star
} from 'lucide-react';

const CATEGORIES_ICONS = {
  'Electronics': Tv,
  'Phones & Tablets': Smartphone,
  'Computers': Laptop,
  'Fashion': Shirt,
  'Shoes': Star,
  'Home & Kitchen': Home,
  'Beauty': Heart,
  'Sports & Fitness': Zap,
  'Baby Products': Baby,
  'Grocery': ShoppingBag,
};

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categories, setCategories] = useState([]);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const suggestTimer = useRef(null);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Search suggestions with debounce
  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    clearTimeout(suggestTimer.current);
    if (q.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    suggestTimer.current = setTimeout(async () => {
      try {
        const data = await api.getProductSuggestions(q);
        setSuggestions(data.slice(0, 6));
        setShowSuggestions(true);
      } catch { setSuggestions([]); }
    }, 300);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      {/* Announcement bar */}
      <div className="announcement-bar text-center hidden sm:block">
        🚚 FREE DELIVERY on orders above ₦50,000 &nbsp;|&nbsp; 📞 0704-683-5621 &nbsp;|&nbsp;
        <span className="font-semibold text-yellow-300">PAY ON DELIVERY AVAILABLE</span>
      </div>

      <header className="bg-white shadow-md sticky top-0 z-50">
        {/* Top row */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center gap-3">
          {/* Hamburger (mobile) */}
          <button
            className="lg:hidden text-gray-600 hover:text-primary flex-shrink-0"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-1">
            <span className="text-xl sm:text-2xl font-black text-primary tracking-tight font-display">
              Shop<span className="text-secondary">Ease</span>
            </span>
            {isAdmin && (
              <span className="hidden sm:inline text-danger text-[10px] font-bold bg-red-50 px-1.5 py-0.5 rounded ml-1">
                ADMIN
              </span>
            )}
          </Link>

          {/* Search bar (desktop) */}
          <div className="flex-1 hidden sm:block" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search for phones, laptops, shoes, groceries..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="w-full pl-4 pr-12 py-2.5 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none text-sm transition-colors bg-gray-50 focus:bg-white"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-4 bg-primary hover:bg-primary-hover text-white rounded-r-lg transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>

              {showSuggestions && suggestions.length > 0 && (
                <div className="search-suggestions">
                  {suggestions.map((s) => (
                    <Link
                      key={s._id}
                      to={`/product/${s._id}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm border-b border-gray-50 last:border-0"
                      onClick={() => { setShowSuggestions(false); setSearchQuery(''); }}
                    >
                      <img
                        src={s.images?.[0] || 'https://placehold.co/40x40'}
                        alt={s.name}
                        className="w-8 h-8 object-contain rounded bg-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{s.name}</p>
                        <p className="text-xs text-primary font-bold">₦{s.discountPrice?.toLocaleString() || s.price?.toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                  <Link
                    to={`/search?q=${encodeURIComponent(searchQuery)}`}
                    className="block text-center text-xs text-primary font-semibold py-2.5 hover:bg-orange-50"
                    onClick={() => setShowSuggestions(false)}
                  >
                    See all results for "{searchQuery}" →
                  </Link>
                </div>
              )}
            </form>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1 sm:gap-3 ml-auto lg:ml-0">
            {/* Wishlist */}
            <Link to="/account?tab=wishlist" className="relative hidden sm:flex flex-col items-center text-gray-600 hover:text-primary p-1.5 transition-colors">
              <Heart className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium hidden lg:block">Wishlist</span>
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length > 9 ? '9+' : wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative flex flex-col items-center text-gray-600 hover:text-primary p-1.5 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium hidden lg:block">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-danger text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Account */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex flex-col items-center text-gray-600 hover:text-primary p-1.5 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5 font-medium hidden lg:flex items-center gap-0.5">
                    {user.name.split(' ')[0]} <ChevronDown className="w-3 h-3" />
                  </span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="px-4 py-3 bg-primary-light border-b border-orange-100">
                      <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link to="/account" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <Package className="w-4 h-4" /> My Orders
                    </Link>
                    <Link to="/account?tab=wishlist" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <Heart className="w-4 h-4" /> Wishlist
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary font-medium hover:bg-orange-50">
                        <LayoutDashboard className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-red-50 border-t border-gray-100">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="hidden sm:block text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Category nav (desktop) */}
        <nav className="hidden lg:block border-t border-gray-100 bg-secondary">
          <div className="max-w-7xl mx-auto px-6 h-10 flex items-center gap-1">
            {categories.slice(0, 9).map((cat) => {
              const Icon = CATEGORIES_ICONS[cat.name] || ShoppingBag;
              return (
                <Link
                  key={cat._id}
                  to={`/category/${cat._id}`}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-gray-200 hover:text-white hover:bg-white/10 rounded transition-colors whitespace-nowrap"
                >
                  <Icon className="w-3 h-3" />
                  {cat.name}
                </Link>
              );
            })}
            <Link to="/" className="ml-auto flex items-center gap-1 px-3 py-1 text-xs font-medium text-yellow-300 hover:text-yellow-200 whitespace-nowrap">
              ⚡ Flash Sales
            </Link>
            <Link to="/track" className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-200 hover:text-white whitespace-nowrap">
              Track Order
            </Link>
          </div>
        </nav>

        {/* Mobile search bar */}
        <div className="sm:hidden px-3 pb-2">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-3 pr-10 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none text-sm bg-gray-50"
            />
            <button type="submit" className="absolute right-0 top-0 h-full px-3 text-primary">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </header>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />
          <div className="drawer-panel">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-secondary">
              <span className="text-xl font-black text-white font-display">Shop<span className="text-primary">Ease</span></span>
              <button onClick={() => setDrawerOpen(false)} className="text-gray-300 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {user ? (
              <div className="px-4 py-3 bg-primary-light border-b border-orange-100">
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            ) : (
              <div className="p-4 border-b border-gray-100 flex gap-2">
                <Link to="/login" onClick={() => setDrawerOpen(false)} className="flex-1 text-center py-2 border border-primary text-primary rounded-lg text-sm font-semibold">Sign In</Link>
                <Link to="/register" onClick={() => setDrawerOpen(false)} className="flex-1 text-center py-2 bg-primary text-white rounded-lg text-sm font-semibold">Register</Link>
              </div>
            )}

            <div className="p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Shop by Category</p>
              {categories.map((cat) => {
                const Icon = CATEGORIES_ICONS[cat.name] || ShoppingBag;
                return (
                  <Link
                    key={cat._id}
                    to={`/category/${cat._id}`}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 py-2.5 border-b border-gray-50 text-gray-700 hover:text-primary text-sm font-medium"
                  >
                    <Icon className="w-4 h-4 text-primary" />
                    {cat.name}
                  </Link>
                );
              })}
            </div>

            <div className="p-4 border-t border-gray-100">
              {user && (
                <>
                  <Link to="/account" onClick={() => setDrawerOpen(false)} className="flex items-center gap-2 py-2 text-sm text-gray-700"><Package className="w-4 h-4" /> My Orders</Link>
                  <Link to="/account?tab=wishlist" onClick={() => setDrawerOpen(false)} className="flex items-center gap-2 py-2 text-sm text-gray-700"><Heart className="w-4 h-4" /> Wishlist</Link>
                  {isAdmin && <Link to="/admin" onClick={() => setDrawerOpen(false)} className="flex items-center gap-2 py-2 text-sm text-primary font-medium"><LayoutDashboard className="w-4 h-4" /> Admin Panel</Link>}
                  <button onClick={() => { handleLogout(); setDrawerOpen(false); }} className="flex items-center gap-2 py-2 text-sm text-danger w-full"><LogOut className="w-4 h-4" /> Sign Out</button>
                </>
              )}
              <Link to="/track" onClick={() => setDrawerOpen(false)} className="flex items-center gap-2 py-2 text-sm text-gray-700"><Package className="w-4 h-4" /> Track Order</Link>
              <Link to="/reseller" onClick={() => setDrawerOpen(false)} className="flex items-center gap-2 py-2 text-sm text-gray-700"><Star className="w-4 h-4" /> Become a Reseller</Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
