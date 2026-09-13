import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, ChevronRight, X, ChevronDown } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

function sortProducts(products, sort) {
  const arr = [...products];
  if (sort === 'price_asc') return arr.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
  if (sort === 'price_desc') return arr.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
  if (sort === 'rating') return arr.sort((a, b) => b.ratingsAverage - a.ratingsAverage);
  return arr; // newest
}

function filterProducts(products, { minPrice, maxPrice, inStock, brands, minRating }) {
  return products.filter(p => {
    const price = p.discountPrice || p.price;
    if (minPrice && price < minPrice) return false;
    if (maxPrice && price > maxPrice) return false;
    if (inStock && p.stock === 0) return false;
    if (brands.length > 0 && p.brand && !brands.includes(p.brand)) return false;
    if (minRating && p.ratingsAverage < minRating) return false;
    return true;
  });
}

export default function CategoryPage() {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('newest');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ minPrice: '', maxPrice: '', inStock: false, brands: [], minRating: 0 });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getProducts(id ? `?category=${id}` : ''),
      id ? api.getCategory(id) : Promise.resolve(null),
    ]).then(([prods, cat]) => {
      setProducts(prods);
      setCategory(cat);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const allBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];
  const filtered = filterProducts(products, {
    minPrice: filters.minPrice ? Number(filters.minPrice) : null,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : null,
    inStock: filters.inStock,
    brands: filters.brands,
    minRating: filters.minRating,
  });
  const sorted = sortProducts(filtered, sort);

  const toggleBrand = (brand) => {
    setFilters(f => ({
      ...f,
      brands: f.brands.includes(brand) ? f.brands.filter(b => b !== brand) : [...f.brands, brand],
    }));
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Price Range (₦)</h4>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div>
        <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Availability</h4>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={e => setFilters(f => ({ ...f, inStock: e.target.checked }))}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-sm text-gray-700">In Stock Only</span>
        </label>
      </div>

      {allBrands.length > 0 && (
        <div>
          <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Brand</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {allBrands.map(brand => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm text-gray-700">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Min Rating</h4>
        <div className="flex gap-2">
          {[0, 3, 4, 4.5].map(r => (
            <button
              key={r}
              onClick={() => setFilters(f => ({ ...f, minRating: r }))}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                filters.minRating === r ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:border-primary/50'
              }`}
            >
              {r === 0 ? 'All' : `${r}★+`}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setFilters({ minPrice: '', maxPrice: '', inStock: false, brands: [], minRating: 0 })}
        className="w-full py-2 text-sm text-primary border border-primary rounded-lg hover:bg-primary-light transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-gray-500 mb-4">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-900 font-medium">{category?.name || 'All Products'}</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 font-display">{category?.name || 'All Products'}</h1>
          {!loading && <p className="text-sm text-gray-500 mt-1">{sorted.length} product{sorted.length !== 1 ? 's' : ''} found</p>}
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile filter btn */}
          <button
            onClick={() => setFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:border-primary focus:outline-none appearance-none cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary" /> Filters
            </h3>
            <FilterPanel />
          </div>
        </aside>

        {/* Mobile filter drawer */}
        {filterOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setFilterOpen(false)} />
            <div className="fixed right-0 top-0 h-full w-80 bg-white z-50 overflow-y-auto p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
                <button onClick={() => setFilterOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <FilterPanel />
              <button
                onClick={() => setFilterOpen(false)}
                className="mt-4 w-full py-3 bg-primary text-white rounded-xl font-semibold"
              >
                Apply Filters
              </button>
            </div>
          </>
        )}

        {/* Products grid */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <div key={i} className="bg-white rounded-xl h-64 skeleton" />)}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <SlidersHorizontal className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-500 text-sm mb-4">Try adjusting your filters.</p>
              <button
                onClick={() => setFilters({ minPrice: '', maxPrice: '', inStock: false, brands: [], minRating: 0 })}
                className="text-primary text-sm font-semibold hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {sorted.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
