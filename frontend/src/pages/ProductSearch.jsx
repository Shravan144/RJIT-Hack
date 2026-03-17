import { useState, useEffect } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import BarcodeScanner from '../components/BarcodeScanner';
import { ScanLine, Package, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";

export default function ProductSearch() {
  const { t } = useTranslation();

  const CATEGORY_FILTERS = [
    {
      key: 'category',
      label: t('productSearch.category') || 'Category',
      options: [
        { value: 'pesticide',  label: t('productSearch.pesticide') || 'Pesticide'  },
        { value: 'fertilizer', label: t('productSearch.fertilizer') || 'Fertilizer' },
        { value: 'seed',       label: t('productSearch.seed') || 'Seed'       },
        { value: 'herbicide',  label: t('productSearch.herbicide') || 'Herbicide'  },
        { value: 'fungicide',  label: t('productSearch.fungicide') || 'Fungicide'  },
        { value: 'equipment',  label: t('productSearch.equipment') || 'Equipment'  },
      ],
    },
  ];

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
      toast.success(t('productSearch.found', { name: data.name }) || `Found: ${data.name}`);
    } catch {
      toast.error(t('productSearch.notFound') || 'Product not found');
      setProducts([]);
    }
  };

  return (
    <div className="bg-brand-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10 pb-20">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl md:text-4xl text-brand-base mb-3 tracking-tight">{t('productSearch.title')}</h1>
          <p className="text-brand-muted text-lg max-w-2xl">{t('productSearch.desc')}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center mb-8 bg-brand-surface border border-brand-border p-4 rounded-2xl shadow-sm">
          <div className="flex-1">
            <SearchBar
              placeholder={t('productSearch.placeholder')}
              onSearch={q => setParams(p => ({ ...p, search: q }))}
              filters={CATEGORY_FILTERS}
              onFilterChange={(key, val) => setParams(p => ({ ...p, [key]: val }))}
            />
          </div>
          <button id="open-scanner-btn"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 border border-transparent text-white font-bold hover:bg-emerald-700 shadow-sm transition-all shrink-0 w-full md:w-auto"
            onClick={() => setScannerOpen(true)}>
            <ScanLine size={18} /> {t('productSearch.scanBarcode') || 'Scan Barcode'}
          </button>
        </div>

        {scannerOpen && <BarcodeScanner onDetect={handleBarcodeScan} onClose={() => setScannerOpen(false)} />}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-brand-surface border border-brand-subtle shadow-sm flex flex-col p-5 animate-pulse">
                <div className="h-32 bg-slate-100 rounded-xl mb-4 w-full" />
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center p-12 bg-brand-surface border border-brand-border rounded-3xl shadow-sm">
            <div className="flex flex-col items-center max-w-sm text-center">
               <div className="w-16 h-16 bg-brand-bg text-slate-300 rounded-full flex items-center justify-center mb-4">
                 <Package size={32} />
               </div>
               <h3 className="font-bold text-brand-base text-lg mb-2">No Products Found</h3>
               <p className="text-brand-muted text-sm">{t('productSearch.noProducts') || 'We couldn\'t find any products matching your search. Try adjusting the filters or searching differently.'}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
