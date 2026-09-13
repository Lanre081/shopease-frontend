import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { formatNaira, calcDiscount } from '../utils/format';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const price = product.price;
  const salePrice = product.discountPrice || product.flashSalePrice;
  const discount = calcDiscount(price, salePrice);
  const displayPrice = salePrice || price;
  const imageUrl = product.images?.[0] || product.image || 'https://placehold.co/300x300';
  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) addToCart(product, 1);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className="product-card group flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://placehold.co/300x300'; }}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <span className="discount-badge">-{discount}%</span>
          )}
          {product.isFlashSale && (
            <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black px-1.5 py-0.5 rounded">⚡ FLASH</span>
          )}
          {product.isBestSeller && (
            <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">BESTSELLER</span>
          )}
        </div>

        {/* Wishlist btn */}
        <button
          onClick={handleWishlist}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all ${
            wishlisted
              ? 'bg-red-500 text-white'
              : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white'
          }`}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
        </button>

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-grow">
        {product.brand && (
          <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-0.5">{product.brand}</p>
        )}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 flex-grow leading-snug">{product.name}</h3>

        {/* Rating */}
        {product.ratingsQuantity > 0 && (
          <div className="flex items-center gap-1 mb-1.5">
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < Math.round(product.ratingsAverage) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-500">({product.ratingsQuantity})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-end justify-between mt-auto">
          <div>
            <p className="text-base font-black text-gray-900">{formatNaira(displayPrice)}</p>
            {discount > 0 && (
              <p className="text-xs text-gray-400 line-through">{formatNaira(price)}</p>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
              product.stock === 0
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-hover active:scale-95'
            }`}
            title={product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>

        {/* Stock warning */}
        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-[10px] text-red-500 font-semibold mt-1">Only {product.stock} left!</p>
        )}
      </div>
    </Link>
  );
}
