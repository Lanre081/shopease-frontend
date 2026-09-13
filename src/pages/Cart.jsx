import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatNaira } from '../utils/format';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shipping = cartTotal > 50000 ? 0 : cartTotal > 0 ? 2500 : 0;
  const total = cartTotal + shipping;

  const handleCheckout = () => {
    if (!user) { navigate('/login?redirect=/checkout'); return; }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added anything yet. Start shopping!</p>
          <Link to="/" className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-primary/25 inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-black text-gray-900 mb-6 font-display">Shopping Cart ({cart.length} item{cart.length !== 1 ? 's' : ''})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-50">
              {cart.map((item, idx) => (
                <li key={`${item.productId}-${item.variant}-${idx}`} className="p-4 sm:p-5 flex gap-4">
                  <Link to={`/product/${item.productId}`} className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 p-1.5">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" onError={(e) => { e.target.src = 'https://placehold.co/100x100'; }} />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.productId}`} className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2 hover:text-primary">
                      {item.name}
                    </Link>
                    {item.variant && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.variant}</p>
                    )}
                    <p className="text-base font-black text-primary mt-1">{formatNaira(item.price)}</p>
                  </div>

                  <div className="flex flex-col items-end justify-between gap-2">
                    {/* Qty stepper */}
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, item.variant, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 h-8 flex items-center justify-center text-sm font-bold border-x border-gray-200">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variant, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-gray-900">{formatNaira(item.price * item.quantity)}</p>
                      <button
                        onClick={() => removeFromCart(item.productId, item.variant)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm pb-4 border-b border-gray-100 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-medium">{formatNaira(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                  {shipping === 0 ? '🎉 FREE' : formatNaira(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded-lg">
                  Add {formatNaira(50000 - cartTotal)} more for free delivery!
                </p>
              )}
            </div>
            <div className="flex justify-between font-black text-gray-900 text-lg mb-5">
              <span>Total</span>
              <span className="text-primary">{formatNaira(total)}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
            <Link to="/" className="w-full block text-center text-sm text-gray-500 hover:text-primary mt-3 py-2">
              ← Continue Shopping
            </Link>

            <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5">
              <p className="text-xs text-gray-500 flex items-center gap-1.5">🔒 Secure, encrypted checkout</p>
              <p className="text-xs text-gray-500 flex items-center gap-1.5">💳 Pay on Delivery available</p>
              <p className="text-xs text-gray-500 flex items-center gap-1.5">↩️ 7-day easy return policy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
