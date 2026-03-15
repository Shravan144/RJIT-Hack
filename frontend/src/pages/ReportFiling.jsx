import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { AlertTriangle, Upload, CheckCircle } from 'lucide-react';
import { useTranslation } from "react-i18next";

const inputCls = "w-full px-3.5 py-2.5 rounded-lg bg-[hsl(220,14%,16%)] border border-[hsl(220,14%,24%)] text-slate-100 text-sm outline-none focus:border-green-400 placeholder-slate-500 transition-all";

export default function ReportFiling() {
  const { t } = useTranslation();

  const CATEGORIES = [
    { value: 'fake_product',    label: t('reportFiling.catFake') },
    { value: 'overpricing',     label: t('reportFiling.catOverprice') },
    { value: 'unlicensed',      label: t('reportFiling.catUnlicensed') },
    { value: 'expired_product', label: t('reportFiling.catExpired') },
    { value: 'wrong_advice',    label: t('reportFiling.catWrongAdvice') },
    { value: 'other',           label: t('reportFiling.catOther') },
  ];
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dealers, setDealers] = useState([]);
  const [products, setProducts] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    dealer: searchParams.get('dealer') || '',
    product: '', category: 'fake_product', description: '', evidence_image: null,
  });

  useEffect(() => {
    api.get('/dealers/', { params: { page_size: 100 } }).then(({ data }) => setDealers(data.results || data));
    api.get('/products/', { params: { page_size: 100 } }).then(({ data }) => setProducts(data.results || data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.dealer) { toast.error(t('reportFiling.selectDealer')); return; }
    if (form.description.length < 20) { toast.error(t('reportFiling.descPlaceholder')); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      await api.post('/reports/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSubmitted(true);
      toast.success(t('reportFiling.successTitle'));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit report.');
    } finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="bg-[hsl(220,16%,12%)] border border-[hsl(220,14%,24%)] rounded-2xl p-12 text-center max-w-md">
          <CheckCircle size={64} className="text-green-400 mx-auto mb-5" />
          <h2 className="font-display font-black text-2xl mb-3">{t('reportFiling.successTitle')}</h2>
          <p className="text-slate-400 mb-7">{t('reportFiling.successDesc')}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button id="file-another-btn"
              className="px-5 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              onClick={() => { setSubmitted(false); setForm({ dealer: '', product: '', category: 'fake_product', description: '', evidence_image: null }); }}>
              {t('reportFiling.fileAnother')}
            </button>
            <button id="view-dealers-btn"
              className="px-5 py-2.5 rounded-xl bg-[hsl(220,14%,16%)] border border-[hsl(220,14%,24%)] text-slate-300 font-semibold text-sm hover:border-green-400 hover:text-white transition-all"
              onClick={() => navigate('/dealers')}>
              {t('reportFiling.browseDealers')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 pb-20">
      <div className="mb-8">
        <h1 className="font-display font-black text-4xl text-slate-100 mb-2">{t('reportFiling.title')}</h1>
        <p className="text-slate-400">{t('reportFiling.desc')}</p>
      </div>

      {!user && (
        <div className="flex items-center gap-2.5 px-4 py-3 mb-6 rounded-xl bg-amber-400/8 border border-amber-400/25 text-amber-400 text-sm">
          <AlertTriangle size={15} className="shrink-0" />
          {t('reportFiling.anonymousWarning')} <a href="/" className="text-green-400 font-semibold hover:underline ml-1 mx-1">{t('reportFiling.login')}</a> {t('reportFiling.toTrack')}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Dealer */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-400" htmlFor="report-dealer">{t('reportFiling.dealerLabel')}</label>
          <select id="report-dealer" required className={`${inputCls} cursor-pointer`}
            value={form.dealer} onChange={e => setForm(f => ({ ...f, dealer: e.target.value }))}>
            <option value="">{t('reportFiling.selectDealer')}</option>
            {dealers.map(d => <option key={d.id} value={d.id}>{d.shop_name} — {d.license_number}</option>)}
          </select>
        </div>

        {/* Product */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-400" htmlFor="report-product">{t('reportFiling.productLabel')}</label>
          <select id="report-product" className={`${inputCls} cursor-pointer`}
            value={form.product} onChange={e => setForm(f => ({ ...f, product: e.target.value }))}>
            <option value="">{t('reportFiling.selectProduct')}</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name} — {p.brand}</option>)}
          </select>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-400" htmlFor="report-category">{t('reportFiling.categoryLabel')}</label>
          <select id="report-category" required className={`${inputCls} cursor-pointer`}
            value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-400" htmlFor="report-desc">{t('reportFiling.descLabel')}</label>
          <textarea id="report-desc" rows={5} required
            placeholder={t('reportFiling.descPlaceholder')}
            className={`${inputCls} resize-y`}
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <span className="text-xs text-slate-600 text-right">{form.description.length} {t('reportFiling.chars')}</span>
        </div>

        {/* Evidence */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-400" htmlFor="report-image">{t('reportFiling.imageLabel')}</label>
          <label htmlFor="report-image"
            className="flex items-center gap-2.5 px-4 py-3 rounded-lg border border-dashed border-[hsl(220,14%,24%)] text-slate-500 text-sm cursor-pointer hover:border-green-400 hover:text-slate-200 transition-all w-full">
            <Upload size={15} />
            {form.evidence_image ? form.evidence_image.name : t('reportFiling.chooseImage')}
          </label>
          <input id="report-image" type="file" accept="image/*" className="hidden"
            onChange={e => setForm(f => ({ ...f, evidence_image: e.target.files[0] }))} />
        </div>

        <button id="submit-report-btn" type="submit" disabled={loading}
          className="mt-2 py-3.5 px-7 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-base shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 transition-all self-start">
          {loading ? t('reportFiling.submitting') : t('reportFiling.submitLabel')}
        </button>
      </form>
    </div>
  );
}
