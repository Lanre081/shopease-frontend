import { useState } from 'react';
import { api } from '../services/api';
import { Package, Truck, CheckCircle, PackageOpen } from 'lucide-react';

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await api.trackOrder(orderId, phone);
      setOrder(data);
    } catch (err) {
      setError(err.message || 'Order not found. Please check your details.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const statusMap = {
    pending: { icon: Package, label: 'Order Received', color: 'text-gray-500' },
    processing: { icon: PackageOpen, label: 'Processing', color: 'text-blue-500' },
    shipped: { icon: Truck, label: 'Dispatched', color: 'text-indigo-500' },
    out_for_delivery: { icon: Truck, label: 'Out for Delivery', color: 'text-orange-500' },
    delivered: { icon: CheckCircle, label: 'Delivered', color: 'text-green-500' },
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Track Your Order</h1>
        <p className="text-gray-600">Enter your order number and phone number to see the latest updates.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 mb-10">
        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input 
              type="text" 
              placeholder="Order ID (e.g. 64a...)" 
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="flex-1">
            <input 
              type="tel" 
              placeholder="Phone Number" 
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors whitespace-nowrap disabled:opacity-70"
          >
            {loading ? 'Tracking...' : 'Track'}
          </button>
        </form>
        {error && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
      </div>

      {order && (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</h2>
              <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold uppercase">
              {order.status}
            </span>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            <div className="space-y-8 relative">
              {order.orderTimeline && order.orderTimeline.map((event, idx) => {
                const step = statusMap[event.status] || { icon: Package, label: event.status, color: 'text-gray-500' };
                const Icon = step.icon;
                return (
                  <div key={idx} className="flex items-start">
                    <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-gray-200 ${step.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="ml-6 pt-1">
                      <h4 className="text-base font-bold text-gray-900">{step.label}</h4>
                      <p className="text-sm text-gray-500 mt-1">{new Date(event.date).toLocaleString()}</p>
                      {event.description && <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">{event.description}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
