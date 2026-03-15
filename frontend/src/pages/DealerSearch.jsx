import { useState, useEffect } from 'react';
import api from '../api/axios';
import DealerCard from '../components/DealerCard';
import SearchBar from '../components/SearchBar';
import MapView from '../components/MapView';
import { LayoutGrid, Map } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DealerSearch() {
  const { t } = useTranslation();

  const FILTERS = [
    {
      key: 'license_status',
      label: t('dealerSearch.licenseStatus'),
      options: [
        { value: 'active',    label: t('dealerSearch.active') },
        { value: 'suspended', label: t('dealerSearch.suspended') },
        { value: 'expired',   label: t('dealerSearch.expired') },
      ],
    },
  ];

  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [params, setParams] = useState({ search: '', license_status: '', ordering: '-trust_score' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchDealers(); }, [params, page]);

  const fetchDealers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/dealers/', { params: { ...params, page } });
      setDealers(data.results || data);
      if (data.count) setTotalPages(Math.ceil(data.count / 10));
    } catch { setDealers([]); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pb-20">
      <div className="mb-8">
        <h1 className="font-display font-black text-4xl text-brand-base mb-2">{t('dealerSearch.title')}</h1>
        <p className="text-brand-muted">{t('dealerSearch.desc')}</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-start mb-6">
        <div className="flex-1 min-w-64">
          <SearchBar
            placeholder={t('dealerSearch.placeholder')}
            onSearch={q => { setParams(p => ({ ...p, search: q })); setPage(1); }}
            filters={FILTERS}
            onFilterChange={(key, val) => { setParams(p => ({ ...p, [key]: val })); setPage(1); }}
          />
        </div>
        <div className="flex gap-1 p-1 bg-brand-elevated border border-brand-border rounded-lg">
          <button id="grid-view-btn"
            className={`p-2 rounded-md transition-all ${view === 'grid' ? 'bg-gradient-primary text-white' : 'text-brand-muted hover:text-brand-base'}`}
            onClick={() => setView('grid')}><LayoutGrid size={16} /></button>
          <button id="map-view-btn"
            className={`p-2 rounded-md transition-all ${view === 'map' ? 'bg-gradient-primary text-white' : 'text-brand-muted hover:text-brand-base'}`}
            onClick={() => setView('map')}><Map size={16} /></button>
        </div>
        <select id="sort-select"
          className="px-3 py-2.5 rounded-lg bg-brand-elevated border border-brand-border text-brand-base text-sm outline-none focus:border-green-400 cursor-pointer transition-all"
          value={params.ordering}
          onChange={e => setParams(p => ({ ...p, ordering: e.target.value }))}>
          <option value="-trust_score">{t('dealerSearch.highestTrust')}</option>
          <option value="trust_score">{t('dealerSearch.lowestTrust')}</option>
          <option value="name">{t('dealerSearch.nameAZ')}</option>
          <option value="-created_at">{t('dealerSearch.newestFirst')}</option>
        </select>
      </div>

      {/* Content */}
      {view === 'map' ? (
        <MapView dealers={dealers} />
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-52 rounded-2xl skeleton-shimmer" />
          ))}
        </div>
      ) : dealers.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-brand-muted">
          {t('dealerSearch.noDealers')}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dealers.map(d => <DealerCard key={d.id} dealer={d} />)}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-5 mt-10 text-brand-muted text-sm">
            <button id="prev-page-btn" disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-brand-elevated border border-brand-border hover:border-green-400 hover:text-brand-base disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              onClick={() => setPage(p => p - 1)}>{t('dealerSearch.prev')}</button>
            <span>{t('dealerSearch.pageOf', { page, totalPages })}</span>
            <button id="next-page-btn" disabled={page >= totalPages}
              className="px-4 py-2 rounded-lg bg-brand-elevated border border-brand-border hover:border-green-400 hover:text-brand-base disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              onClick={() => setPage(p => p + 1)}>{t('dealerSearch.next')}</button>
          </div>
        </>
      )}
    </div>
  );
}
