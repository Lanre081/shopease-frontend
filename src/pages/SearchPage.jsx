import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState('newest');
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;
    setLoading(true);
    api.getProducts(`?search=${encodeURIComponent(query)}`)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query]);

  const sorted = (() => {
    let arr = inStockOnly ? products.filter(p => p.stock > 0) : [...products];
    if (sort === 'price_asc') return arr.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    if (sort === 'price_desc') return arr.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    if (sort === 'rating') return arr.sort((a, b) => b.ratingsAverage - a.ratingsAverage);
    return arr;
  })();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-white rounded-2xl px-6 py-5 border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="flex-1">
            <h1 className="font-bold text-gray-900">
              {loading ? 'Searching…' : `${sorted.length} result${sorted.length !== 1 ? 's' : ''} for`}{' '}
              <span className="text-primary">"{query}"</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={e => setInStockOnly(e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
          In Stock Only
        </label>
        <div className="relative">
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:border-primary focus:outline-none appearance-none"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => <div key={i} className="bg-white rounded-xl h-64 skeleton" />)}
        </div>
      ) : !query.trim() ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Type something in the search bar to find products.</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-700 mb-2">No results for "{query}"</h3>
          <p className="text-gray-500 text-sm mb-4">Try a different spelling or a more general keyword.</p>
          <Link to="/" className="text-primary font-semibold text-sm hover:underline">← Browse all products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {sorted.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
