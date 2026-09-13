//export const API_BASE = "/api";
export const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export async function apiRequest(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "../data/mockData";

export const api = {
  // Auth
  register: (payload) => apiRequest("/auth/register", { method: "POST", body: payload }),
  login: (payload) => apiRequest("/auth/login", { method: "POST", body: payload }),
  getProfile: () => apiRequest("/auth/profile", { auth: true }),

  // Products
  getProducts: async (query = "") => {
    try {
      const res = await apiRequest(`/products${query}`);
      if (Array.isArray(res) && res.length > 0) return res;
      throw new Error("No products returned");
    } catch {
      // Graceful fallback to mock products
      let list = [...MOCK_PRODUCTS];
      if (query) {
        const params = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
        const cat = params.get("category");
        const search = params.get("search");
        const flash = params.get("flash");
        const featured = params.get("featured");
        const bestseller = params.get("bestseller");

        if (cat) list = list.filter(p => p.categoryId === cat || p.category?.slug === cat || p.category?.name === cat);
        if (flash === 'true') list = list.filter(p => p.isFlashSale);
        if (featured === 'true') list = list.filter(p => p.isFeatured);
        if (bestseller === 'true') list = list.filter(p => p.isBestSeller);
        if (search) {
          const q = search.toLowerCase();
          list = list.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
        }
      }
      return list;
    }
  },

  getProduct: async (id) => {
    try {
      const res = await apiRequest(`/products/${id}`);
      if (res && (res._id || res.id)) return res;
      throw new Error("Product not found");
    } catch {
      const found = MOCK_PRODUCTS.find(p => p._id === id || p.id === id);
      if (found) return found;
      return MOCK_PRODUCTS[0];
    }
  },

  getProductSuggestions: async (q) => {
    try {
      const res = await apiRequest(`/products/suggestions?q=${encodeURIComponent(q)}`);
      if (Array.isArray(res)) return res;
      throw new Error();
    } catch {
      if (!q || q.trim().length < 2) return [];
      const term = q.toLowerCase();
      return MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(term)).slice(0, 5);
    }
  },

  // Categories
  getCategories: async () => {
    try {
      const res = await apiRequest("/categories");
      if (Array.isArray(res) && res.length > 0) return res;
      throw new Error();
    } catch {
      return MOCK_CATEGORIES;
    }
  },

  getCategory: async (id) => {
    try {
      const res = await apiRequest(`/categories/${id}`);
      if (res && res.name) return res;
      throw new Error();
    } catch {
      return MOCK_CATEGORIES.find(c => c.id === id || c.slug === id) || MOCK_CATEGORIES[0];
    }
  },

  // Orders
  createOrder: (payload) => apiRequest("/orders", { method: "POST", body: payload, auth: true }),
  getMyOrders: () => apiRequest("/orders/my", { auth: true }),
  getOrder: (id) => apiRequest(`/orders/${id}`, { auth: true }),
  trackOrder: (orderId, phone) => apiRequest(`/orders/${orderId}/track?phone=${encodeURIComponent(phone)}`),

  // Reviews
  createReview: (productId, data) => apiRequest(`/reviews/${productId}`, { method: "POST", body: data, auth: true }),
  getProductReviews: (productId) => apiRequest(`/reviews/${productId}`),

  // Admin
  getMetrics: () => apiRequest("/admin/metrics", { auth: true }),
  getUsers: () => apiRequest("/admin/users", { auth: true }),
  createProduct: (payload) => apiRequest("/products", { method: "POST", body: payload, auth: true }),
  updateProduct: (id, payload) => apiRequest(`/products/${id}`, { method: "PUT", body: payload, auth: true }),
  deleteProduct: (id) => apiRequest(`/products/${id}`, { method: "DELETE", auth: true }),
  getOrders: () => apiRequest("/orders", { auth: true }),
  updateOrderStatus: (id, payload) => apiRequest(`/orders/${id}`, { method: "PUT", body: payload, auth: true }),
  createCategory: (payload) => apiRequest("/categories", { method: "POST", body: payload, auth: true }),
  updateCategory: (id, payload) => apiRequest(`/categories/${id}`, { method: "PUT", body: payload, auth: true }),
  deleteCategory: (id) => apiRequest(`/categories/${id}`, { method: "DELETE", auth: true }),

  // Delivery & Reseller
  getDeliveryRegions: () => apiRequest("/delivery-regions"),
  submitResellerApplication: (data) => apiRequest("/resellers", { method: "POST", body: data }),
};
