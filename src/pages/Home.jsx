import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import { formatNaira, calcDiscount } from '../utils/format';
import {
  Tv, Smartphone, Laptop, Shirt, Home as HomeIcon, Zap, Baby, ShoppingBag, Star, Dumbbell,
  Truck, ShieldCheck, Headphones, Wallet, ArrowRight, ChevronLeft, ChevronRight
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Electronics': { icon: Tv, color: 'bg-blue-50 text-blue-600' },
  'Phones & Tablets': { icon: Smartphone, color: 'bg-purple-50 text-purple-600' },
  'Computers': { icon: Laptop, color: 'bg-indigo-50 text-indigo-600' },
  'Fashion': { icon: Shirt, color: 'bg-pink-50 text-pink-600' },
  'Shoes': { icon: Star, color: 'bg-orange-50 text-orange-600' },
  'Home & Kitchen': { icon: HomeIcon, color: 'bg-green-50 text-green-600' },
  'Beauty': { icon: ShoppingBag, color: 'bg-rose-50 text-rose-600' },
  'Sports & Fitness': { icon: Dumbbell, color: 'bg-yellow-50 text-yellow-600' },
  'Baby Products': { icon: Baby, color: 'bg-sky-50 text-sky-600' },
  'Grocery': { icon: ShoppingBag, color: 'bg-emerald-50 text-emerald-600' },
};

function FlashTimer() {
  const [time, setTime] = useState({ h: 5, m: 59, s: 59 });
  useEffect(() => {
    const t = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 5; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const pad = (n) => String(n).padStart(2, '0');
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-300 font-medium">Ends in:</span>
      <span className="timer-digit">{pad(time.h)}</span>
      <span className="text-white font-bold">:</span>
      <span className="timer-digit">{pad(time.m)}</span>
      <span className="text-white font-bold">:</span>
      <span className="timer-digit">{pad(time.s)}</span>
    </div>
  );
}

function ProductRow({ products, loading }) {
  const ref = useRef(null);
  const scroll = (dir) => {
    if (ref.current) ref.current.scrollBy({ left: dir * 240, behavior: 'smooth' });
  };
  if (loading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex-shrink-0 w-48 sm:w-56 bg-white rounded-xl h-64 skeleton" />
        ))}
      </div>
    );
  }
  if (!products.length) return null;
  return (
    <div className="relative group">
      <button onClick={() => scroll(-1)} className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-gray-100 hover:bg-primary hover:text-white hover:border-primary">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div ref={ref} className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {products.map(p => (
          <div key={p._id} className="flex-shrink-0 w-48 sm:w-56">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
      <button onClick={() => scroll(1)} className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-gray-100 hover:bg-primary hover:text-white hover:border-primary">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [flashSale, setFlashSale] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [prods, cats] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
        ]);
        setProducts(prods);
        setCategories(cats);
        setFlashSale(prods.filter(p => p.isFlashSale).slice(0, 8));
        setFeatured(prods.filter(p => p.isFeatured).slice(0, 8));
        setBestSellers(prods.filter(p => p.isBestSeller).slice(0, 8));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Fallback: if no tagged products, use latest
  const featuredShow = featured.length > 0 ? featured : products.slice(0, 8);
  const bestSellersShow = bestSellers.length > 0 ? bestSellers : products.slice(4, 12);
  const flashShow = flashSale.length > 0 ? flashSale : products.slice(0, 6);

  return (
    <div className="-mt-4 sm:-mt-8">
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f2552 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 z-10">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-xs font-bold mb-4">
              ⚡ Nigeria's Trusted Marketplace
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-tight mb-4 font-display">
              Shop Smarter,<br />
              <span className="text-primary">Save Bigger.</span>
            </h1>
            <p className="text-gray-300 text-base sm:text-lg mb-8 max-w-lg">
              Thousands of genuine products — phones, electronics, fashion, home essentials — delivered fast to your doorstep across Nigeria.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/" className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-primary/30">
                Shop Now
              </Link>
              <Link to="/track" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-xl font-semibold transition-all">
                Track Order
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-8">
              {[['50K+', 'Happy Customers'], ['5K+', 'Products'], ['36', 'States Covered']].map(([n, l]) => (
                <div key={l}>
                  <p className="text-xl font-black text-primary">{n}</p>
                  <p className="text-xs text-gray-400">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-primary/10 blur-3xl absolute inset-0" />
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&q=80"
                alt="Shopping"
                className="relative z-10 w-64 sm:w-80 rounded-2xl object-cover shadow-2xl"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── TRUST BAR ──────────────────────────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
          {[
            { icon: Wallet, title: 'Pay on Delivery', desc: 'No upfront payment required' },
            { icon: Truck, title: 'Fast Delivery', desc: 'Across all 36 states' },
            { icon: ShieldCheck, title: 'Genuine Products', desc: 'Quality guaranteed' },
            { icon: Headphones, title: '24/7 Support', desc: 'Always here to help' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-sm">{title}</p>
                <p className="text-xs text-gray-500 truncate">{desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ── SHOP BY CATEGORY ────────────────────────────── */}
        {categories.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-display">Shop by Category</h2>
              <Link to="/" className="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">All categories <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3">
              {categories.slice(0, 10).map((cat) => {
                const cfg = CATEGORY_ICONS[cat.name] || { icon: ShoppingBag, color: 'bg-gray-50 text-gray-600' };
                const Icon = cfg.icon;
                return (
                  <Link
                    key={cat._id}
                    to={`/category/${cat._id}`}
                    className="category-card bg-white rounded-xl p-3 flex flex-col items-center gap-2 text-center border border-gray-100 hover:border-primary/30"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${cfg.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 leading-tight">{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── FLASH SALES ─────────────────────────────────── */}
        {flashShow.length > 0 && (
          <section className="mb-10 bg-secondary rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-white font-display flex items-center gap-2">⚡ Flash Sales</h2>
                <FlashTimer />
              </div>
              <Link to="/" className="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ProductRow products={flashShow} loading={loading} />
          </section>
        )}

        {/* ── FEATURED PRODUCTS ─────────────────────────── */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-display">Featured Products</h2>
            <Link to="/" className="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[1,2,3,4,5].map(i => <div key={i} className="bg-white rounded-xl h-64 skeleton" />)}
            </div>
          ) : featuredShow.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Products will appear here once added to the catalogue.</p>
              <Link to="/admin" className="mt-4 inline-block text-primary text-sm font-medium hover:underline">Go to Admin Panel →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {featuredShow.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </section>

        {/* ── BANNER ─────────────────────────────────────── */}
        <section className="mb-10 grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-700 p-6 sm:p-8 flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm font-semibold mb-1">New Arrivals</p>
              <h3 className="text-white text-xl sm:text-2xl font-black mb-3">Latest Phones<br/>& Gadgets</h3>
              <Link to="/category" className="bg-white text-purple-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-50 transition-colors inline-block">
                Shop Now →
              </Link>
            </div>
            <Smartphone className="w-16 h-16 text-white/30" />
          </div>
          <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-orange-500 to-red-500 p-6 sm:p-8 flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-semibold mb-1">Best Deals</p>
              <h3 className="text-white text-xl sm:text-2xl font-black mb-3">Fashion & Style<br/>Up to 40% Off</h3>
              <Link to="/category" className="bg-white text-orange-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-50 transition-colors inline-block">
                Shop Now →
              </Link>
            </div>
            <Shirt className="w-16 h-16 text-white/30" />
          </div>
        </section>

        {/* ── BEST SELLERS ───────────────────────────────── */}
        {bestSellersShow.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-display">🏆 Best Sellers</h2>
              <Link to="/" className="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ProductRow products={bestSellersShow} loading={loading} />
          </section>
        )}

        {/* ── NEW ARRIVALS ───────────────────────────────── */}
        {products.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-display">🆕 New Arrivals</h2>
              <Link to="/" className="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.slice(0, 10).map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
