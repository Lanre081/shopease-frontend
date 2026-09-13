import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { formatNaira, calcDiscount, formatDate, statusColor } from '../utils/format';
import {
  ChevronRight, Star, Heart, ShoppingCart, Zap, Truck,
  ShieldCheck, RotateCcw, Package, ChevronLeft, ChevronRight as ChevronRightIcon,
  Minus, Plus
} from 'lucide-react';

function StarBar({ rating, count }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
      ))}
      <span className="text-sm text-gray-500 ml-1">({count} reviews)</span>
    </div>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [mainImage, setMainImage] = useState(0);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  useEffect(() => {
    setLoading(true);
    setError(null);
    setMainImage(0);
    setQty(1);
    setAdded(false);
    const load = async () => {
      try {
        const data = await api.getProduct(id);
        setProduct(data);
        if (data.variants) {
          const defaults = {};
          data.variants.forEach(v => { defaults[v.name] = v.options[0]; });
          setSelectedVariants(defaults);
        }
        // Related products (same category)
        if (data.categoryId) {
          const all = await api.getProducts(`?category=${data.categoryId}`);
          setRelated(all.filter(p => p._id !== data._id).slice(0, 6));
        }
        // Reviews
        try {
          const revs = await api.getProductReviews(id);
          setReviews(revs);
        } catch {}
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="skeleton rounded-2xl h-96" />
          <div className="space-y-4">
            <div className="skeleton h-8 rounded w-3/4" />
            <div className="skeleton h-6 rounded w-1/2" />
            <div className="skeleton h-10 rounded w-1/3" />
            <div className="skeleton h-24 rounded" />
          </div>
        </div>
      </div>
    );
  }
  if (error) return <div className="text-red-500 py-12 text-center max-w-7xl mx-auto px-4">{error}</div>;
  if (!product) return null;

  const inStock = product.stock > 0;
  const images = product.images?.length > 0 ? product.images : ['https://placehold.co/500x500'];
  const displayPrice = product.discountPrice || product.flashSalePrice || product.price;
  const discount = calcDiscount(product.price, product.discountPrice || product.flashSalePrice);
  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = () => {
    const variant = Object.entries(selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ');
    addToCart(product, qty, variant);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    const variant = Object.entries(selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ');
    addToCart(product, qty, variant);
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="w-3 h-3" />
        {product.category && (
          <>
            <Link to={`/category/${product.categoryId}`} className="hover:text-primary">{product.category.name}</Link>
            <ChevronRight className="w-3 h-3" />
          </>
        )}
        <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-100 mb-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image gallery */}
          <div>
            <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3 flex items-center justify-center border border-gray-100">
              <img
                src={images[mainImage]}
                alt={product.name}
                className="max-h-full max-w-full object-contain p-4"
                onError={(e) => { e.target.src = 'https://placehold.co/500x500'; }}
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden bg-gray-50 ${mainImage === i ? 'border-primary' : 'border-gray-200 hover:border-gray-400'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain p-1" onError={(e) => { e.target.src = 'https://placehold.co/80x80'; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div>
            {product.brand && (
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">{product.brand}</p>
            )}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-snug">{product.name}</h1>

            {/* Rating */}
            {product.ratingsQuantity > 0 && (
              <div className="mb-3">
                <StarBar rating={product.ratingsAverage} count={product.ratingsQuantity} />
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-3 mb-4">
              <span className="text-3xl font-black text-gray-900">{formatNaira(displayPrice)}</span>
              {discount > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatNaira(product.price)}</span>
                  <span className="discount-badge text-sm">{discount}% OFF</span>
                </>
              )}
            </div>

            {/* Stock / badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              {inStock ? (
                <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                  ✓ In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
              )}
              {product.isPODEligible !== false && (
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">💳 Pay on Delivery</span>
              )}
              {product.isFlashSale && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">⚡ Flash Sale</span>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed mb-5">{product.description}</p>

            {/* Variants */}
            {product.variants?.map(v => (
              <div key={v.name} className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  {v.name}: <span className="text-primary">{selectedVariants[v.name]}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {v.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setSelectedVariants(prev => ({ ...prev, [v.name]: opt }))}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                        selectedVariants[v.name] === opt
                          ? 'border-primary bg-primary-light text-primary'
                          : 'border-gray-200 text-gray-700 hover:border-primary/50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Free gifts */}
            {product.freeGifts?.length > 0 && (
              <div className="mb-5 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                <p className="font-bold text-orange-900 text-sm mb-1">🎁 Free Gift Included!</p>
                {product.freeGifts.map((g, i) => (
                  <p key={i} className="text-sm text-orange-800">{g.quantity}x {g.name} — {g.description}</p>
                ))}
              </div>
            )}

            {/* Quantity */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">Quantity</p>
              <div className="flex items-center gap-0">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  disabled={!inStock}
                  className="w-9 h-9 border border-gray-300 rounded-l-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-12 h-9 border-t border-b border-gray-300 flex items-center justify-center text-sm font-bold">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  disabled={!inStock || qty >= product.stock}
                  className="w-9 h-9 border border-gray-300 rounded-r-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mb-5">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  added
                    ? 'bg-success text-white'
                    : inStock
                    ? 'bg-primary hover:bg-primary-hover text-white hover:shadow-lg hover:shadow-primary/25'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                {added ? 'Added to Cart ✓' : inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!inStock}
                className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-white transition-all disabled:opacity-40"
              >
                <Zap className="w-4 h-4" />
                Buy Now
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all ${
                  wishlisted ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Delivery info */}
            <div className="border border-gray-100 rounded-xl p-4 space-y-2.5 bg-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Truck className="w-4 h-4 text-primary" />
                <span><strong>Delivery:</strong> Lagos 1–2 days · Nationwide 3–7 days</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span><strong>Authenticity:</strong> 100% genuine product</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <RotateCcw className="w-4 h-4 text-blue-500" />
                <span><strong>Return:</strong> 7-day easy returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Specifications</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
            {Object.entries(product.specifications).map(([key, val], i) => (
              <div key={key} className={`flex gap-4 py-2.5 px-3 text-sm ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} rounded`}>
                <span className="text-gray-500 font-medium w-40 flex-shrink-0">{key}</span>
                <span className="text-gray-900">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Customer Reviews</h2>
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Star className="w-10 h-10 mx-auto mb-2 text-gray-200" />
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r._id} className="border-b border-gray-50 pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                    {r.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{r.user?.name || 'Customer'}</p>
                    <StarBar rating={r.rating} count={null} />
                  </div>
                  <span className="ml-auto text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-600 pl-10">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-black text-gray-900 mb-4 font-display">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {related.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
