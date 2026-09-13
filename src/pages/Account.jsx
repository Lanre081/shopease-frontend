import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { api } from '../services/api';
import { formatNaira, formatDate, statusColor, statusLabel } from '../utils/format';
import ProductCard from '../components/ProductCard';
import {
  Package, User, Heart, Settings, ChevronRight, LogOut, Star,
  Phone, Mail, Clock
} from 'lucide-react';

const TABS = [
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function Account() {
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'orders';

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab !== 'orders') return;
    setLoadingOrders(true);
    api.getMyOrders()
      .then(setOrders)
      .catch(e => setOrderError(e.message))
      .finally(() => setLoadingOrders(false));
  }, [activeTab]);

  const handleLogout = () => { logout(); navigate('/'); };

  if (!user) return null;

  const setTab = (id) => setSearchParams({ tab: id });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="md:col-span-1">
          {/* User card */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-black">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            {user.role === 'admin' && (
              <span className="inline-block bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Admin</span>
            )}
          </div>

          {/* Nav */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium border-b border-gray-50 last:border-0 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-light text-primary'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === 'wishlist' && wishlist.length > 0 && (
                    <span className="ml-auto text-xs bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full">{wishlist.length}</span>
                  )}
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-danger hover:bg-red-50 border-t border-gray-100 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="md:col-span-3">
          {/* Orders tab */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-black text-gray-900 text-xl font-display">Order History</h2>
              </div>
              <div className="p-4 sm:p-6">
                {loadingOrders ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => <div key={i} className="h-24 skeleton rounded-xl" />)}
                  </div>
                ) : orderError ? (
                  <p className="text-red-500">{orderError}</p>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-700 mb-1">No orders yet</h3>
                    <p className="text-gray-500 text-sm mb-4">Start shopping and your orders will appear here.</p>
                    <button onClick={() => navigate('/')} className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-primary-hover">Shop Now</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order._id} className="border border-gray-100 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between p-4 bg-gray-50">
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              Order #{order._id?.slice(-8).toUpperCase()}
                            </p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {formatDate(order.createdAt)}
                              </span>
                              <span className="text-xs font-bold text-gray-900">{formatNaira(order.totalAmount)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor(order.status)}`}>
                              {statusLabel(order.status)}
                            </span>
                            <button
                              onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                              className="text-primary text-xs font-semibold hover:underline flex items-center gap-0.5"
                            >
                              {expandedOrder === order._id ? 'Hide' : 'Details'}
                              <ChevronRight className={`w-3 h-3 transition-transform ${expandedOrder === order._id ? 'rotate-90' : ''}`} />
                            </button>
                          </div>
                        </div>
                        {expandedOrder === order._id && (
                          <div className="p-4 border-t border-gray-100">
                            <div className="space-y-3 mb-4">
                              {order.items?.map((item, i) => (
                                <div key={i} className="flex gap-3 items-center text-sm">
                                  <img src={item.image || 'https://placehold.co/40x40'} alt={item.name} className="w-10 h-10 object-contain bg-gray-50 rounded-lg border" onError={e => e.target.src='https://placehold.co/40'} />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{item.name}</p>
                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                  </div>
                                  <p className="font-bold text-gray-900 whitespace-nowrap">{formatNaira(item.priceAtPurchase * item.quantity)}</p>
                                </div>
                              ))}
                            </div>
                            {order.shippingAddress && (
                              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                                <p className="font-semibold text-gray-700 mb-1">Delivery to:</p>
                                <p>{order.shippingAddress.fullName} · {order.shippingAddress.phone}</p>
                                <p>{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Wishlist tab */}
          {activeTab === 'wishlist' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-black text-gray-900 text-xl font-display">My Wishlist ({wishlist.length})</h2>
              </div>
              <div className="p-4 sm:p-6">
                {wishlist.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-700 mb-1">Your wishlist is empty</h3>
                    <p className="text-gray-500 text-sm mb-4">Save products you love by clicking the ♥ icon.</p>
                    <button onClick={() => navigate('/')} className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-primary-hover">Browse Products</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {wishlist.map(p => <ProductCard key={p._id} product={p} />)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Profile tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-black text-gray-900 text-xl font-display">Profile Details</h2>
              </div>
              <div className="p-6 max-w-md">
                <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-black">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded uppercase">{user.role}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Full Name</label>
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700">
                      <User className="w-4 h-4 text-gray-400" />
                      {user.name}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Email Address</label>
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {user.email}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
