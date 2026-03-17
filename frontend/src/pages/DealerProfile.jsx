import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import TrustScoreBadge from '../components/TrustScoreBadge';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { MapPin, Phone, Mail, ShieldCheck, ShieldX, Clock, AlertTriangle, ArrowLeft, Package, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getApiMessage } from '../utils/apiMessage';

export default function DealerProfile() {
  const { t } = useTranslation();

  const STATUS_CONFIG = {
    active:    { icon: <ShieldCheck size={16} />, cls: 'bg-emerald-50 border-emerald-200 text-emerald-700',  text: t('dealerProfile.licenseStatus.active') },
    suspended: { icon: <ShieldX size={16} />,    cls: 'bg-red-50 border-red-200 text-red-700',        text: t('dealerProfile.licenseStatus.suspended') },
    expired:   { icon: <Clock size={16} />,      cls: 'bg-amber-50 border-amber-200 text-amber-700', text: t('dealerProfile.licenseStatus.expired') },
    pending:   { icon: <Clock size={16} />,      cls: 'bg-brand-bg border-brand-border text-brand-muted', text: t('dealerProfile.licenseStatus.pending') },
  };
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dealer, setDealer] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([api.get(`/dealers/${id}/`), api.get(`/dealers/${id}/products/`)])
      .then(([dr, pr]) => { setDealer(dr.data); setProducts(pr.data); })
      .catch(() => navigate('/dealers'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error(t('dealerProfile.loginToReview')); return; }
    setSubmitting(true);
    try {
      await api.post(`/dealers/${id}/review/`, reviewForm);
      toast.success(t('dealerProfile.reviewSubmitted'));
      const { data } = await api.get(`/dealers/${id}/`);
      setDealer(data);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) { toast.error(getApiMessage(err, t('dealerProfile.reviewFailed'))); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-slate-400">
      <div className="w-8 h-8 rounded-full border-4 border-brand-subtle border-t-emerald-500 animate-spin" />
      <span className="text-sm font-semibold tracking-wide uppercase">Verifying Profile...</span>
    </div>
  );
  if (!dealer) return null;

  const sc = STATUS_CONFIG[dealer.license_status] || STATUS_CONFIG.pending;
  const tabs = ['overview', 'products', 'reviews', 'report'];

  return (
    <div className="bg-brand-bg min-h-screen pb-24">
      <div className="max-w-5xl mx-auto px-6 pt-8">
        <button id="back-btn" className="flex items-center gap-2 text-brand-muted text-sm font-semibold mb-6 hover:text-brand-base transition-colors"
          onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> {t('dealerProfile.back')}
        </button>

        {/* ── Trust Banner ── */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center bg-brand-surface border border-brand-border rounded-3xl p-6 md:p-8 mb-8 shadow-sm">
          <div className="w-20 h-20 md:w-24 md:h-24 min-w-[80px] rounded-2xl bg-emerald-100 text-emerald-800 text-3xl md:text-5xl font-extrabold flex items-center justify-center shrink-0 border border-emerald-200">
            {dealer.shop_name?.[0]}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="font-display font-bold text-2xl md:text-4xl text-brand-base leading-tight">{dealer.shop_name}</h1>
              {dealer.trust_score >= 4.0 && (
                <div className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] uppercase tracking-widest font-bold rounded-lg border border-blue-200">
                  <ShieldCheck size={14} /> Verified High Trust
                </div>
              )}
            </div>
            <p className="text-brand-muted text-sm md:text-base mb-4 font-medium">{dealer.name}</p>
            
            <div className="flex flex-wrap gap-4 items-center text-sm font-medium">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wide ${sc.cls}`}>
                {sc.icon} {sc.text}
              </div>
              <div className="flex items-center gap-1.5 text-brand-muted">
                <span className="uppercase text-[10px] tracking-wider text-slate-400 font-bold">{t('dealerProfile.license')}:</span> 
                <span className="font-mono text-brand-base">{dealer.license_number}</span>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-brand-subtle">
            <TrustScoreBadge score={dealer.trust_score} />
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 border-b border-brand-border mb-8 overflow-x-auto no-scrollbar">
          {tabs.map(tb => (
            <button key={tb} id={`tab-${tb}`}
              className={`px-5 py-3 text-sm font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all -mb-px
                ${tab === tb ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-400 hover:text-brand-base hover:border-slate-300'}`}
              onClick={() => setTab(tb)}>
              {t(`dealerProfile.tabs.${tb}`)}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="col-span-1 lg:col-span-2 flex flex-col gap-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  [t('dealerProfile.totalReports'), dealer.total_reports],
                  [t('dealerProfile.verifiedReports'), dealer.verified_reports, 'text-emerald-500'],
                  [t('dealerProfile.avgRating'), dealer.avg_rating ?? '—', 'text-amber-500'],
                  [t('dealerProfile.trustScore'), dealer.trust_score, 'text-blue-500'],
                ].map(([label, val, colorClass]) => (
                  <div key={label} className="bg-brand-surface border border-brand-border rounded-2xl p-5 text-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                    <div className={`font-display font-extrabold text-3xl mb-1 ${colorClass || 'text-brand-base'}`}>{val}</div>
                    <div className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">{label}</div>
                  </div>
                ))}
              </div>

              {/* Specializations */}
              {dealer.specializations && (
                <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
                  <h3 className="font-bold text-brand-base mb-4">{t('dealerProfile.specializations') || 'Specializations'}</h3>
                  <div className="flex flex-wrap gap-2">
                    {dealer.specializations.split(',').filter(Boolean).map(t => (
                      <span key={t} className="px-3 py-1.5 rounded-lg bg-brand-bg border border-brand-border text-slate-600 text-xs font-bold uppercase tracking-wider">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Sidebar */}
            <div className="col-span-1">
              <div className="bg-brand-surface border border-brand-border rounded-3xl p-6 shadow-sm sticky top-24">
                <h3 className="font-bold text-brand-base mb-6 uppercase tracking-wider text-xs">Contact Information</h3>
                <div className="flex flex-col gap-6">
                  {[
                    [<MapPin size={20} className="text-slate-400"/>, dealer.address, 'Address'],
                    dealer.district && [<span>📍</span>, `${dealer.district.name}, ${dealer.district.state}`, 'District'],
                    [<Phone size={20} className="text-slate-400"/>, dealer.phone, 'Phone'],
                    dealer.email && [<Mail size={20} className="text-slate-400"/>, dealer.email, 'Email'],
                    dealer.license_expiry && [<Clock size={20} className="text-amber-500"/>, dealer.license_expiry, t('dealerProfile.expires')],
                  ].filter(Boolean).map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="shrink-0 mt-0.5">{item[0]}</div>
                      <div className="flex flex-col text-sm">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{item[2]}</span>
                        <span className="text-brand-base font-medium leading-snug">{item[1]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Products ── */}
        {tab === 'products' && (
          products.length === 0
            ? <div className="flex flex-col items-center gap-4 py-20 bg-brand-surface border border-brand-border rounded-3xl text-slate-400">
                <Package size={48} className="opacity-30" />
                <p className="font-medium">{t('dealerProfile.noProducts')}</p>
              </div>
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map(dp => <ProductCard key={dp.id} product={dp.product} price={dp.price} inStock={dp.in_stock} />)}
              </div>
        )}

        {/* ── Reviews ── */}
        {tab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="col-span-1 lg:col-span-2 flex flex-col gap-4">
              {dealer.reviews?.length === 0 && (
                <div className="py-20 text-center bg-brand-surface border border-brand-border rounded-3xl text-slate-400 font-medium pb-24">
                  {t('dealerProfile.noReviews')}
                </div>
              )}
              {dealer.reviews?.map(r => (
                <div key={r.id} className="bg-brand-surface border border-brand-border shadow-sm rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-brand-muted font-bold text-xs">{r.reviewer_name[0] || 'U'}</div>
                      <span className="font-bold text-brand-base">{r.reviewer_name}</span>
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < r.rating ? "fill-current" : "text-slate-200"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">{r.comment}</p>
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">{new Date(r.created_at).toLocaleDateString('en-IN')}</p>
                </div>
              ))}
            </div>

            <div className="col-span-1">
              {user ? (
                <form onSubmit={handleReview} className="bg-brand-surface border border-brand-border rounded-3xl p-6 shadow-sm sticky top-24 flex flex-col gap-5">
                  <h3 className="font-bold text-brand-base uppercase tracking-wider text-xs">{t('dealerProfile.leaveReview')}</h3>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button" id={`star-${n}`}
                        className={`transition-colors p-1 ${reviewForm.rating >= n ? 'text-amber-400' : 'text-slate-200 hover:text-amber-200'}`}
                        onClick={() => setReviewForm(f => ({ ...f, rating: n }))}>
                        <Star className={reviewForm.rating >= n ? "fill-current" : ""} size={24} />
                      </button>
                    ))}
                  </div>
                  <textarea id="review-comment" rows={4} placeholder={t('dealerProfile.shareExperience')}
                    className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-base text-sm outline-none focus:border-emerald-500 focus:bg-brand-surface placeholder-slate-400 resize-none transition-all"
                    value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} />
                  <button id="submit-review-btn" type="submit" disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-bold text-sm tracking-wide disabled:opacity-50 hover:bg-emerald-700 hover:shadow-md transition-all">
                    {submitting ? t('dealerProfile.submitting') : t('dealerProfile.submitReview')}
                  </button>
                </form>
              ) : (
                <div className="bg-slate-100 border border-brand-border rounded-3xl p-6 text-center text-brand-muted text-sm font-medium">
                  Log in to leave a review.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Report ── */}
        {tab === 'report' && (
          <div className="flex flex-col items-center justify-center gap-6 py-20 bg-brand-surface border border-brand-border rounded-3xl text-center shadow-sm">
            <div className="w-20 h-20 bg-red-50 text-red-500 flex items-center justify-center rounded-full border-4 border-white shadow-sm">
              <AlertTriangle size={36} />
            </div>
            <div>
              <h3 className="font-display font-bold text-2xl text-brand-base mb-2">{t('dealerProfile.reportDealer')}</h3>
              <p className="text-brand-muted max-w-md mx-auto">{t('dealerProfile.reportDesc')}</p>
            </div>
            <button id="goto-report-btn"
              className="mt-4 px-8 py-4 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white font-bold uppercase tracking-wider text-sm transition-all"
              onClick={() => navigate(`/report?dealer=${id}`)}>
              {t('dealerProfile.fileReport')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
