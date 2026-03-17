import { useState, useEffect } from 'react';
import api from '../api/axios';
import DealerCard from '../components/DealerCard';
import SearchBar from '../components/SearchBar';
import MapView from '../components/MapView';
import { LayoutGrid, Map, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DealerSearch() {
  const { t } = useTranslation();

  const FILTERS = [
    {
      key: 'license_status',
      label: t('dealerSearch.licenseStatus') || 'License Status',
      options: [
        { value: 'active',    label: t('dealerSearch.active') || 'Active' },
        { value: 'suspended', label: t('dealerSearch.suspended') || 'Suspended' },
        { value: 'expired',   label: t('dealerSearch.expired') || 'Expired' },
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
    <div className="bg-brand-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10 pb-20">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl md:text-4xl text-brand-base mb-3 tracking-tight">{t('dealerSearch.title')}</h1>
          <p className="text-brand-muted text-lg max-w-2xl">{t('dealerSearch.desc')}</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center mb-8 bg-brand-surface border border-brand-border p-4 rounded-2xl shadow-sm">
          <div className="flex-1">
            <SearchBar
              placeholder={t('dealerSearch.placeholder')}
              onSearch={q => { setParams(p => ({ ...p, search: q })); setPage(1); }}
              filters={FILTERS}
              onFilterChange={(key, val) => { setParams(p => ({ ...p, [key]: val })); setPage(1); }}
            />
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <select id="sort-select"
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-base font-medium text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer transition-all hover:bg-slate-100"
              value={params.ordering}
              onChange={e => setParams(p => ({ ...p, ordering: e.target.value }))}>
              <option value="-trust_score">{t('dealerSearch.highestTrust') || 'Highest Trust'}</option>
              <option value="trust_score">{t('dealerSearch.lowestTrust') || 'Lowest Trust'}</option>
              <option value="name">{t('dealerSearch.nameAZ') || 'Name (A-Z)'}</option>
              <option value="-created_at">{t('dealerSearch.newestFirst') || 'Newest'}</option>
            </select>

            <div className="flex gap-1 p-1 bg-slate-100 border border-brand-border rounded-xl shrink-0">
              <button id="grid-view-btn"
                className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-brand-surface text-emerald-600 shadow-sm border-brand-border' : 'text-slate-400 hover:text-brand-base'}`}
                onClick={() => setView('grid')}><LayoutGrid size={18} /></button>
              <button id="map-view-btn"
                className={`p-2 rounded-lg transition-all ${view === 'map' ? 'bg-brand-surface text-emerald-600 shadow-sm border-brand-border' : 'text-slate-400 hover:text-brand-base'}`}
                onClick={() => setView('map')}><Map size={18} /></button>
            </div>
          </div>
        </div>

        {/* Content */}
        {view === 'map' ? (
          <div className="bg-brand-surface border border-brand-border rounded-3xl overflow-hidden shadow-sm h-[600px]">
            <MapView dealers={dealers} />
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-brand-surface border border-brand-subtle shadow-sm flex flex-col p-5 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-4" />
                <div className="h-3 bg-slate-100 rounded w-1/2 mb-6" />
                <div className="mt-auto flex justify-between">
                  <div className="h-8 bg-slate-100 rounded w-16" />
                  <div className="h-8 bg-slate-100 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : dealers.length === 0 ? (
          <div className="flex items-center justify-center p-12 bg-brand-surface border border-brand-border rounded-3xl shadow-sm">
            <div className="flex flex-col items-center max-w-sm text-center">
               <div className="w-16 h-16 bg-brand-bg text-slate-300 rounded-full flex items-center justify-center mb-4">
                 <Search size={32} />
               </div>
               <h3 className="font-bold text-brand-base text-lg mb-2">No Dealers Found</h3>
               <p className="text-brand-muted text-sm">{t('dealerSearch.noDealers') || 'We couldn\'t find any dealers matching your current filters. Try adjusting your search parameters.'}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {dealers.map(d => <DealerCard key={d.id} dealer={d} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12 bg-brand-surface border border-brand-border py-3 px-6 rounded-full w-max mx-auto shadow-sm">
                <button id="prev-page-btn" disabled={page === 1}
                  className="px-4 py-2 rounded-lg font-bold text-sm text-slate-600 hover:bg-brand-bg hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  onClick={() => setPage(p => p - 1)}>{t('dealerSearch.prev') || 'Previous'}</button>
                <div className="h-4 w-px bg-slate-200" />
                <span className="text-brand-muted text-sm font-semibold tracking-wide">
                  {t('dealerSearch.pageOf', { page, totalPages }) || `Page ${page} of ${totalPages}`}
                </span>
                <div className="h-4 w-px bg-slate-200" />
                <button id="next-page-btn" disabled={page >= totalPages}
                  className="px-4 py-2 rounded-lg font-bold text-sm text-slate-600 hover:bg-brand-bg hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  onClick={() => setPage(p => p + 1)}>{t('dealerSearch.next') || 'Next'}</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
