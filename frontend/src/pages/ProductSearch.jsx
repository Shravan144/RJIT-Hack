import { useState, useEffect } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import BarcodeScanner from '../components/BarcodeScanner';
import { ScanLine, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";

export default function ProductSearch() {
  const { t } = useTranslation();

  const CATEGORY_FILTERS = [
    {
      key: 'category',
      label: t('productSearch.category'),
      options: [
        { value: 'pesticide',  label: t('productSearch.pesticide')  },
        { value: 'fertilizer', label: t('productSearch.fertilizer') },
        { value: 'seed',       label: t('productSearch.seed')       },
        { value: 'herbicide',  label: t('productSearch.herbicide')  },
        { value: 'fungicide',  label: t('productSearch.fungicide')  },
        { value: 'equipment',  label: t('productSearch.equipment')  },
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
      toast.success(t('productSearch.found', { name: data.name }));
    } catch {
      toast.error(t('productSearch.notFound'));
      setProducts([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pb-20">
      <div className="mb-8">
        <h1 className="font-display font-black text-4xl text-brand-base mb-2">{t('productSearch.title')}</h1>
        <p className="text-brand-muted">{t('productSearch.desc')}</p>
      </div>

      <div className="flex flex-wrap gap-3 items-start mb-8">
        <div className="flex-1 min-w-64">
          <SearchBar
            placeholder={t('productSearch.placeholder')}
            onSearch={q => setParams(p => ({ ...p, search: q }))}
            filters={CATEGORY_FILTERS}
            onFilterChange={(key, val) => setParams(p => ({ ...p, [key]: val }))}
          />
        </div>
        <button id="open-scanner-btn"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-elevated border border-brand-border text-brand-muted text-sm font-medium hover:border-green-400 hover:text-brand-base transition-all shrink-0"
          onClick={() => setScannerOpen(true)}>
          <ScanLine size={16} /> {t('productSearch.scanBarcode')}
        </button>
      </div>

      {scannerOpen && <BarcodeScanner onDetect={handleBarcodeScan} onClose={() => setScannerOpen(false)} />}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-52 rounded-2xl skeleton-shimmer" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-brand-muted">
          <Package size={48} className="opacity-40" />
          <p>{t('productSearch.noProducts')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
