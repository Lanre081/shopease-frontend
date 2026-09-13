import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatNaira, formatDate, statusColor, statusLabel } from '../utils/format';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag, Plus, Edit, Trash2,
  X, Save, AlertCircle, TrendingUp, Star, ArrowUpDown, Eye, Check
} from 'lucide-react';

const ADMIN_TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'customers', label: 'Customers', icon: Users },
];

const STATUS_OPTIONS = ['pending','processing','shipped','out_for_delivery','delivered','cancelled'];

function MetricCard({ icon: Icon, label, value, sub, color = 'bg-primary' }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
      <div className={`w-12 h-12 ${color} bg-opacity-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-black text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const EMPTY_PRODUCT = {
  name: '', price: '', discountPrice: '', stock: '', brand: '',
  description: '', images: '', category: '',
  isFeatured: false, isBestSeller: false, isFlashSale: false,
  isPODEligible: true,
};

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Product form
  const [showProductModal, setShowProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // Category form
  const [showCatForm, setShowCatForm] = useState(false);
  const [catName, setCatName] = useState('');

  // Order status
  const [updatingOrder, setUpdatingOrder] = useState(null);

  useEffect(() => {
    if (!isAdmin) navigate('/');
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (activeTab === 'overview') loadMetrics();
    if (activeTab === 'products') loadProducts();
    if (activeTab === 'orders') loadOrders();
    if (activeTab === 'categories') loadCategories();
    if (activeTab === 'customers') loadCustomers();
  }, [activeTab]);

  const loadMetrics = async () => {
    try { setMetrics(await api.getMetrics()); } catch {}
  };
  const loadProducts = async () => {
    setLoading(true);
    try { setProducts(await api.getProducts()); } catch {} finally { setLoading(false); }
  };
  const loadOrders = async () => {
    setLoading(true);
    try { setOrders(await api.getOrders()); } catch {} finally { setLoading(false); }
  };
  const loadCategories = async () => {
    try { setCategories(await api.getCategories()); } catch {}
  };
  const loadCustomers = async () => {
    setLoading(true);
    try { setCustomers(await api.getUsers()); } catch {} finally { setLoading(false); }
  };

  const openNewProduct = () => { setEditProduct(null); setProductForm(EMPTY_PRODUCT); setFormError(null); setShowProductModal(true); };
  const openEditProduct = (p) => {
    setEditProduct(p);
    setProductForm({
      name: p.name || '', price: p.price || '', discountPrice: p.discountPrice || '',
      stock: p.stock || '', brand: p.brand || '', description: p.description || '',
      images: (p.images || []).join('\n'), category: p.categoryId || '',
      isFeatured: !!p.isFeatured, isBestSeller: !!p.isBestSeller, isFlashSale: !!p.isFlashSale,
      isPODEligible: p.isPODEligible !== false,
    });
    setFormError(null);
    setShowProductModal(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price) { setFormError('Name and Price are required.'); return; }
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        ...productForm,
        price: parseFloat(productForm.price),
        discountPrice: productForm.discountPrice ? parseFloat(productForm.discountPrice) : null,
        stock: parseInt(productForm.stock) || 0,
        images: productForm.images.split('\n').map(s => s.trim()).filter(Boolean),
        categoryId: productForm.category || null,
      };
      delete payload.category;
      if (editProduct) {
        await api.updateProduct(editProduct._id, payload);
      } else {
        await api.createProduct(payload);
      }
      setShowProductModal(false);
      loadProducts();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try { await api.deleteProduct(id); setProducts(p => p.filter(x => x._id !== id)); } catch (e) { alert(e.message); }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    setUpdatingOrder(orderId);
    try {
      await api.updateOrderStatus(orderId, { status });
      setOrders(o => o.map(x => x._id === orderId ? { ...x, status } : x));
    } catch (e) { alert(e.message); } finally { setUpdatingOrder(null); }
  };

  const handleCreateCategory = async () => {
    if (!catName.trim()) return;
    try { await api.createCategory({ name: catName.trim() }); setCatName(''); loadCategories(); } catch (e) { alert(e.message); }
  };

  if (!isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-900 font-display">Admin Dashboard</h1>
        <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">{user?.name}</span>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 shadow-sm mb-6 overflow-x-auto">
        {ADMIN_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === id ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MetricCard icon={TrendingUp} label="Total Revenue" value={metrics ? formatNaira(metrics.totalRevenue) : '—'} sub="All time" color="bg-primary" />
            <MetricCard icon={ShoppingBag} label="Total Orders" value={metrics?.totalOrders ?? '—'} sub={`${metrics?.pendingOrders ?? 0} pending`} color="bg-blue-500" />
            <MetricCard icon={Package} label="Products" value={metrics?.totalProducts ?? '—'} sub={`${metrics?.lowStockCount ?? 0} low stock`} color="bg-yellow-500" />
            <MetricCard icon={Users} label="Customers" value={metrics?.totalUsers ?? '—'} color="bg-green-500" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">Recent Orders</h3>
              {metrics?.recentOrders?.slice(0,5).map(o => (
                <div key={o._id} className="flex items-center justify-between py-2 border-b border-gray-50 text-sm last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">#{o._id?.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-500">{formatDate(o.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatNaira(o.totalAmount)}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor(o.status)}`}>{statusLabel(o.status)}</span>
                  </div>
                </div>
              ))}
              {!metrics?.recentOrders?.length && <p className="text-gray-400 text-sm text-center py-4">No recent orders</p>}
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button onClick={() => { setActiveTab('products'); setTimeout(openNewProduct, 100); }} className="w-full flex items-center gap-2 px-4 py-3 bg-primary-light text-primary rounded-xl font-semibold text-sm hover:bg-orange-100">
                  <Plus className="w-4 h-4" /> Add New Product
                </button>
                <button onClick={() => setActiveTab('orders')} className="w-full flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-semibold text-sm hover:bg-blue-100">
                  <ShoppingBag className="w-4 h-4" /> Manage Orders
                </button>
                <button onClick={() => setActiveTab('categories')} className="w-full flex items-center gap-2 px-4 py-3 bg-gray-50 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-100">
                  <Tag className="w-4 h-4" /> Manage Categories
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS */}
      {activeTab === 'products' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">{products.length} Products</h2>
            <button onClick={openNewProduct} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-sm font-bold">
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
          {loading ? <div className="h-64 skeleton rounded-2xl" /> : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-4 py-3">Product</th>
                      <th className="text-right px-4 py-3">Price</th>
                      <th className="text-right px-4 py-3">Stock</th>
                      <th className="text-left px-4 py-3">Tags</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map(p => (
                      <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 flex items-center gap-3 min-w-[200px]">
                          <img src={p.images?.[0] || p.image || 'https://placehold.co/40'} alt="" className="w-10 h-10 rounded-lg object-contain bg-gray-50 border border-gray-100" onError={e => e.target.src='https://placehold.co/40'} />
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate max-w-[160px]">{p.name}</p>
                            <p className="text-xs text-gray-500">{p.brand || p.category?.name || '—'}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className="font-bold text-gray-900">{formatNaira(p.discountPrice || p.price)}</p>
                          {p.discountPrice && <p className="text-xs text-gray-400 line-through">{formatNaira(p.price)}</p>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-bold text-sm ${p.stock <= 0 ? 'text-red-500' : p.stock <= 5 ? 'text-orange-500' : 'text-green-600'}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {p.isFeatured && <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded">Featured</span>}
                            {p.isBestSeller && <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded">Bestseller</span>}
                            {p.isFlashSale && <span className="text-[10px] bg-yellow-100 text-yellow-700 font-bold px-1.5 py-0.5 rounded">Flash</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => openEditProduct(p)} className="p-1.5 text-primary hover:bg-primary-light rounded-lg" title="Edit">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteProduct(p._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {products.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Package className="w-10 h-10 mx-auto mb-2" />
                    <p>No products yet. <button onClick={openNewProduct} className="text-primary font-semibold hover:underline">Add one →</button></p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ORDERS */}
      {activeTab === 'orders' && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">{orders.length} Orders</h2>
          {loading ? <div className="h-64 skeleton rounded-2xl" /> : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-4 py-3">Order</th>
                      <th className="text-left px-4 py-3">Customer</th>
                      <th className="text-right px-4 py-3">Amount</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Date</th>
                      <th className="px-4 py-3">Change Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map(o => (
                      <tr key={o._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono font-bold text-xs text-gray-700">#{o._id?.slice(-8).toUpperCase()}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{o.user?.name || o.shippingAddress?.fullName || '—'}</p>
                          <p className="text-xs text-gray-500">{o.shippingAddress?.phone}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">{formatNaira(o.totalAmount)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColor(o.status)}`}>{statusLabel(o.status)}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(o.createdAt)}</td>
                        <td className="px-4 py-3">
                          <select
                            value={o.status}
                            onChange={e => handleUpdateOrderStatus(o._id, e.target.value)}
                            disabled={updatingOrder === o._id}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:border-primary focus:outline-none disabled:opacity-50"
                          >
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orders.length === 0 && <div className="text-center py-12 text-gray-400"><ShoppingBag className="w-10 h-10 mx-auto mb-2" /><p>No orders yet.</p></div>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CATEGORIES */}
      {activeTab === 'categories' && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Categories</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
            <div className="flex gap-2">
              <input
                value={catName}
                onChange={e => setCatName(e.target.value)}
                placeholder="New category name..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
              <button onClick={handleCreateCategory} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-hover flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.map(cat => (
              <div key={cat._id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{cat.name}</p>
                  <p className="text-xs text-gray-500">{cat._count?.products ?? 0} products</p>
                </div>
                <button onClick={async () => { if(confirm(`Delete category "${cat.name}"?`)) { try { await api.deleteCategory(cat._id); loadCategories(); } catch(e){alert(e.message);} } }} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CUSTOMERS */}
      {activeTab === 'customers' && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">{customers.length} Customers</h2>
          {loading ? <div className="h-64 skeleton rounded-2xl" /> : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-4 py-3">Customer</th>
                    <th className="text-left px-4 py-3">Email</th>
                    <th className="text-left px-4 py-3">Role</th>
                    <th className="text-left px-4 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {customers.map(c => (
                    <tr key={c._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {c.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{c.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${c.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}>
                          {c.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDate(c.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {customers.length === 0 && <div className="text-center py-12 text-gray-400"><Users className="w-10 h-10 mx-auto mb-2" /><p>No customers yet.</p></div>}
            </div>
          )}
        </div>
      )}

      {/* PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="font-black text-gray-900 text-lg">{editProduct ? 'Edit Product' : 'New Product'}</h3>
              <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4" /> {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Product Name *</label>
                  <input value={productForm.name} onChange={e => setProductForm(f=>({...f,name:e.target.value}))} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Price (₦) *</label>
                  <input type="number" value={productForm.price} onChange={e => setProductForm(f=>({...f,price:e.target.value}))} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Discount Price (₦)</label>
                  <input type="number" value={productForm.discountPrice} onChange={e => setProductForm(f=>({...f,discountPrice:e.target.value}))} placeholder="Optional" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Stock</label>
                  <input type="number" value={productForm.stock} onChange={e => setProductForm(f=>({...f,stock:e.target.value}))} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Brand</label>
                  <input value={productForm.brand} onChange={e => setProductForm(f=>({...f,brand:e.target.value}))} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Category</label>
                  <select value={productForm.category} onChange={e => setProductForm(f=>({...f,category:e.target.value}))} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:border-primary focus:outline-none">
                    <option value="">-- Select Category --</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label>
                  <textarea rows={3} value={productForm.description} onChange={e => setProductForm(f=>({...f,description:e.target.value}))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Image URLs (one per line)</label>
                  <textarea rows={3} value={productForm.images} onChange={e => setProductForm(f=>({...f,images:e.target.value}))} placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none font-mono" />
                </div>
              </div>

              {/* Flags */}
              <div className="flex flex-wrap gap-4 pt-2">
                {[
                  { key: 'isFeatured', label: 'Featured' },
                  { key: 'isBestSeller', label: 'Best Seller' },
                  { key: 'isFlashSale', label: 'Flash Sale' },
                  { key: 'isPODEligible', label: 'Pay on Delivery' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={productForm[key]}
                      onChange={e => setProductForm(f=>({...f,[key]:e.target.checked}))}
                      className="w-4 h-4 accent-primary"
                    />
                    {label}
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowProductModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 text-sm">Cancel</button>
                <button onClick={handleSaveProduct} disabled={saving} className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                  <Save className="w-4 h-4" /> {saving ? 'Saving…' : editProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
