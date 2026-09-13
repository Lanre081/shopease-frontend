import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatNaira } from '../utils/format';
import { CheckCircle, ChevronRight, Truck, CreditCard, ClipboardList } from 'lucide-react';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT - Abuja','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara',
  'Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau',
  'Rivers','Sokoto','Taraba','Yobe','Zamfara'
];

const STEPS = [
  { id: 'address', label: 'Delivery', icon: Truck },
  { id: 'review', label: 'Review', icon: ClipboardList },
  { id: 'payment', label: 'Payment', icon: CreditCard },
];

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0); // 0=address, 1=review, 2=payment
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [addr, setAddr] = useState({
    fullName: user?.name || '',
    phone: '',
    street: '',
    landmark: '',
    city: '',
    state: 'Lagos',
    deliveryNotes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('Payment on Delivery');

  const shipping = cartTotal > 50000 ? 0 : 2500;
  const total = cartTotal + shipping;

  if (!user) {
    navigate('/login?redirect=/checkout');
    return null;
  }
  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleAddrChange = (e) => setAddr(a => ({ ...a, [e.target.name]: e.target.value }));

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const order = await api.createOrder({
        items: cart.map(i => ({ productId: i.productId, quantity: i.quantity, variant: i.variant })),
        shippingAddress: { ...addr, country: 'Nigeria' },
        paymentMethod,
        itemsPrice: cartTotal,
        taxPrice: 0,
        shippingPrice: shipping,
        totalAmount: total,
      });
      clearCart();
      navigate(`/order/${order._id || order.id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-black text-gray-900 mb-6 font-display">Checkout</h1>

      {/* Step indicators */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const active = i === step;
          return (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold text-sm transition-all ${
                  done ? 'step-done' : active ? 'step-active' : 'step-inactive'
                }`}>
                  {done ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`text-xs mt-1 font-medium ${active ? 'text-primary' : done ? 'text-green-600' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-success' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          {/* Step 0: Address */}
          {step === 0 && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2"><Truck className="w-5 h-5 text-primary" /> Delivery Address</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Full Name *</label>
                  <input name="fullName" value={addr.fullName} onChange={handleAddrChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Phone Number (Nigerian) *</label>
                  <input name="phone" value={addr.phone} onChange={handleAddrChange} required placeholder="080... or 070..." className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Street Address *</label>
                  <input name="street" value={addr.street} onChange={handleAddrChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Closest Landmark</label>
                  <input name="landmark" value={addr.landmark} onChange={handleAddrChange} placeholder="e.g. Opposite First Bank" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">City *</label>
                    <input name="city" value={addr.city} onChange={handleAddrChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">State *</label>
                    <select name="state" value={addr.state} onChange={handleAddrChange} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:border-primary focus:outline-none">
                      {NIGERIAN_STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Delivery Notes</label>
                  <textarea name="deliveryNotes" value={addr.deliveryNotes} onChange={handleAddrChange} rows={2} placeholder="Any special delivery instructions?" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none" />
                </div>
                <button
                  onClick={() => {
                    if (!addr.fullName || !addr.phone || !addr.street || !addr.city) {
                      setError('Please fill in all required fields.');
                      return;
                    }
                    setError(null);
                    setStep(1);
                  }}
                  className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold flex items-center justify-center gap-2 mt-2"
                >
                  Continue to Review <ChevronRight className="w-4 h-4" />
                </button>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              </div>
            </div>
          )}

          {/* Step 1: Review */}
          {step === 1 && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-primary" /> Review Order</h2>
              <div className="mb-4 p-3 bg-gray-50 rounded-xl text-sm">
                <p className="font-semibold text-gray-900">{addr.fullName}</p>
                <p className="text-gray-600">{addr.phone}</p>
                <p className="text-gray-600">{addr.street}{addr.landmark ? `, ${addr.landmark}` : ''}</p>
                <p className="text-gray-600">{addr.city}, {addr.state}, Nigeria</p>
                {addr.deliveryNotes && <p className="text-gray-500 text-xs mt-1 italic">Notes: {addr.deliveryNotes}</p>}
                <button onClick={() => setStep(0)} className="text-primary text-xs font-semibold hover:underline mt-1">Edit address</button>
              </div>
              <div className="space-y-3 mb-4">
                {cart.map((item, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-contain bg-gray-50 rounded-lg border border-gray-100 p-1" onError={e => e.target.src='https://placehold.co/50x50'} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      {item.variant && <p className="text-xs text-gray-500">{item.variant}</p>}
                    </div>
                    <p className="text-sm font-bold text-gray-900 whitespace-nowrap">
                      {formatNaira(item.price)} × {item.quantity}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(0)} className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50">Back</button>
                <button onClick={() => setStep(2)} className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold flex items-center justify-center gap-2">
                  Choose Payment <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" /> Payment Method</h2>
              <div className="space-y-3 mb-5">
                {[
                  { val: 'Payment on Delivery', label: 'Pay on Delivery', desc: 'Cash or transfer when your order arrives', icon: '💵' },
                  { val: 'Online Payment', label: 'Online Payment', desc: 'Pay securely by card or bank transfer now', icon: '💳' },
                ].map(opt => (
                  <label key={opt.val} className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === opt.val ? 'border-primary bg-primary-light' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value={opt.val} checked={paymentMethod === opt.val} onChange={() => setPaymentMethod(opt.val)} className="mt-0.5 accent-primary" />
                    <div>
                      <p className="font-bold text-gray-900">{opt.icon} {opt.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              {error && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</p>}
              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50">Back</button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? 'Placing Order…' : `Place Order — ${formatNaira(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm sticky top-24">
            <h3 className="font-bold text-gray-900 mb-3">Summary</h3>
            <div className="space-y-1.5 text-sm text-gray-600 border-b border-gray-100 pb-3 mb-3">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-medium">{formatNaira(cartTotal)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>{shipping === 0 ? 'FREE' : formatNaira(shipping)}</span></div>
            </div>
            <div className="flex justify-between font-black text-gray-900 text-base">
              <span>Total</span><span className="text-primary">{formatNaira(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
