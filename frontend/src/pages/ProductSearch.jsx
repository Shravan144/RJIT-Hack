import { useState, useEffect } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import BarcodeScanner from '../components/BarcodeScanner';
import { ScanLine, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_FILTERS = [
  {
    key: 'category',
    label: 'Category',
    options: [
      { value: 'pesticide',  label: 'Pesticide'  },
      { value: 'fertilizer', label: 'Fertilizer' },
      { value: 'seed',       label: 'Seed'       },
      { value: 'herbicide',  label: 'Herbicide'  },
      { value: 'fungicide',  label: 'Fungicide'  },
      { value: 'equipment',  label: 'Equipment'  },
    ],
  },
];

export default function ProductSearch() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [params, setParams] = useState({ search: '', category: '' });

  useEffect(() => { fetchProducts(); }, [params]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products/', { params });
      setProducts(data.results || data);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  const handleBarcodeScan = async (barcode) => {
    try {
      const { data } = await api.get('/products/by_barcode/', { params: { barcode } });
      setProducts([data]);
      toast.success(`Found: ${data.name}`);
    } catch {
      toast.error('Product not found for this barcode.');
      setProducts([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pb-20">
      <div className="mb-8">
        <h1 className="font-display font-black text-4xl text-slate-100 mb-2">Product Verification</h1>
        <p className="text-slate-400">Search products by name, brand, or scan a barcode to verify authenticity.</p>
      </div>

      <div className="flex flex-wrap gap-3 items-start mb-8">
        <div className="flex-1 min-w-64">
          <SearchBar
            placeholder="Search by name, brand, or barcode..."
            onSearch={q => setParams(p => ({ ...p, search: q }))}
            filters={CATEGORY_FILTERS}
            onFilterChange={(key, val) => setParams(p => ({ ...p, [key]: val }))}
          />
        </div>
        <button id="open-scanner-btn"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[hsl(220,14%,16%)] border border-[hsl(220,14%,24%)] text-slate-300 text-sm font-medium hover:border-green-400 hover:text-white transition-all whitespace-nowrap"
          onClick={() => setScannerOpen(true)}>
          <ScanLine size={16} /> Scan Barcode
        </button>
      </div>

      {scannerOpen && <BarcodeScanner onDetect={handleBarcodeScan} onClose={() => setScannerOpen(false)} />}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-52 rounded-2xl skeleton-shimmer" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-slate-500">
          <Package size={48} className="opacity-40" />
          <p>No products found. Try scanning a barcode!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
