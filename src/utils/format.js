// Naira currency formatter
export const formatNaira = (amount) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);

// Calculate discount percentage
export const calcDiscount = (price, discountPrice) => {
  if (!discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
};

// Format a date string to readable Nigerian format
export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

// Truncate a string
export const truncate = (str, length = 60) => {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '…' : str;
};

// Star rating array helper  [true, true, true, false, false] for rating=3
export const getRatingStars = (rating) =>
  Array.from({ length: 5 }, (_, i) => i < Math.round(rating));

// Order status badge colors
export const statusColor = (status) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    out_for_delivery: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
};

export const statusLabel = (status) => {
  const map = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return map[status] || status;
};
