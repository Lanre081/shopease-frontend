import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { formatNaira, formatDate, statusColor, statusLabel } from '../utils/format';
import { CheckCircle, Package, Truck, MapPin, Phone } from 'lucide-react';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getOrder(id)
      .then(setOrder)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full skeleton mx-auto mb-4" />
        <div className="h-8 skeleton rounded w-64 mx-auto mb-3" />
        <div className="h-4 skeleton rounded w-48 mx-auto" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/" className="text-primary hover:underline">← Back to Home</Link>
      </div>
    );
  }
  if (!order) return null;

  const addr = order.shippingAddress || {};

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Success header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2 font-display">Order Confirmed! 🎉</h1>
        <p className="text-gray-500">Thank you, <strong>{addr.fullName}</strong>! Your order has been received.</p>
        <p className="text-sm text-gray-400 mt-1">Order ID: <span className="font-mono font-bold text-gray-700">#{order._id?.slice(-10).toUpperCase()}</span></p>
      </div>

      {/* Order info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        {/* Status */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <span className="font-semibold text-gray-900 text-sm">Status</span>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor(order.status)}`}>
            {statusLabel(order.status)}
          </span>
        </div>

        {/* Items */}
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Items Ordered</p>
          <div className="space-y-3">
            {order.items?.map((item, i) => (
              <div key={i} className="flex gap-3 items-center">
                <img
                  src={item.image || 'https://placehold.co/50x50'}
                  alt={item.name}
                  className="w-12 h-12 object-contain bg-gray-50 rounded-lg border border-gray-100 p-1"
                  onError={e => e.target.src = 'https://placehold.co/50x50'}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                  {item.variant && <p className="text-xs text-gray-500">{item.variant}</p>}
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-gray-900 whitespace-nowrap">{formatNaira(item.priceAtPurchase * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery address */}
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Delivery To</p>
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">{addr.fullName}</p>
              <p>{addr.street}{addr.landmark ? `, ${addr.landmark}` : ''}</p>
              <p>{addr.city}, {addr.state}, Nigeria</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700 mt-2">
            <Phone className="w-4 h-4 text-primary flex-shrink-0" />
            <span>{addr.phone}</span>
          </div>
        </div>

        {/* Totals */}
        <div className="px-5 py-4">
          <div className="space-y-1.5 text-sm text-gray-600">
            <div className="flex justify-between"><span>Items Total</span><span>{formatNaira(order.itemsPrice)}</span></div>
            <div className="flex justify-between"><span>Delivery Fee</span><span>{order.shippingPrice === 0 ? 'FREE' : formatNaira(order.shippingPrice)}</span></div>
            <div className="flex justify-between font-black text-gray-900 text-base pt-2 border-t border-gray-100 mt-2">
              <span>Total Paid</span><span className="text-primary">{formatNaira(order.totalAmount)}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Payment: <strong>{order.paymentMethod}</strong>
          </p>
        </div>
      </div>

      {/* What happens next */}
      <div className="bg-primary-light border border-orange-100 rounded-2xl p-5 mb-6">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Truck className="w-4 h-4 text-primary" /> What happens next?</h3>
        <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
          <li>We'll confirm your order within <strong>2 hours</strong> via call/SMS</li>
          <li>Your order is <strong>packed and dispatched</strong> within 24 hours</li>
          <li>Lagos: delivered in <strong>1–2 business days</strong></li>
          <li>Other states: delivered in <strong>3–7 business days</strong></li>
        </ol>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/account" className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-center transition-all">
          View My Orders
        </Link>
        <Link to="/" className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 text-center">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
