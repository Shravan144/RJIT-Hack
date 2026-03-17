import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { AlertTriangle, Upload, CheckCircle, Store, Package, FileText, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from "react-i18next";
import { getApiMessage } from '../utils/apiMessage';

const inputCls = "w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-base text-sm outline-none focus:border-emerald-500 focus:bg-brand-surface placeholder-slate-400 transition-all";
const labelCls = "text-sm font-bold text-brand-base mb-1.5 flex items-center gap-2";

export default function ReportFiling() {
  const { t } = useTranslation();

  const CATEGORIES = [
    { value: 'fake_product',    label: t('reportFiling.catFake') || 'Fake Product' },
    { value: 'overpricing',     label: t('reportFiling.catOverprice') || 'Overpricing' },
    { value: 'unlicensed',      label: t('reportFiling.catUnlicensed') || 'Unlicensed Dealer' },
    { value: 'expired_product', label: t('reportFiling.catExpired') || 'Expired Product' },
    { value: 'wrong_advice',    label: t('reportFiling.catWrongAdvice') || 'Wrong Advice' },
    { value: 'other',           label: t('reportFiling.catOther') || 'Other' },
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
    if (!form.dealer) { toast.error(t('reportFiling.selectDealer') || 'Please select a dealer'); return; }
    if (form.description.length < 20) { toast.error(t('reportFiling.descPlaceholder') || 'Description too short'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      await api.post('/reports/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSubmitted(true);
      toast.success(t('reportFiling.successTitle') || 'Report Submitted');
    } catch (err) {
      toast.error(getApiMessage(err, 'Failed to submit report.'));
    } finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-brand-bg">
        <div className="bg-brand-surface border border-brand-border rounded-3xl p-10 md:p-14 text-center max-w-lg shadow-sm">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-white shadow-sm">
            <CheckCircle size={48} className="text-emerald-500" />
          </div>
          <h2 className="font-display font-bold text-3xl mb-4 text-brand-base tracking-tight">{t('reportFiling.successTitle') || 'Report Submitted'}</h2>
          <p className="text-brand-muted mb-10 text-lg">{t('reportFiling.successDesc') || 'Thank you for your report. Our team will review this shortly to ensure a safe environment for all.'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button id="file-another-btn"
              className="px-6 py-3.5 rounded-xl bg-emerald-600 border border-transparent text-white font-bold text-base hover:bg-emerald-700 transition-all shadow-sm w-full sm:w-auto"
              onClick={() => { setSubmitted(false); setForm({ dealer: '', product: '', category: 'fake_product', description: '', evidence_image: null }); }}>
              {t('reportFiling.fileAnother') || 'File Another Report'}
            </button>
            <button id="view-dealers-btn"
              className="px-6 py-3.5 rounded-xl bg-brand-surface border-2 border-brand-border text-brand-base font-bold text-base hover:border-emerald-500 hover:text-emerald-700 transition-all w-full sm:w-auto"
              onClick={() => navigate('/dealers')}>
              {t('reportFiling.browseDealers') || 'Browse Dealers'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-bg min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-10 pb-20">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-2xl mb-6 shadow-sm border border-red-200">
            <AlertTriangle size={32} />
          </div>
          <h1 className="font-display font-bold text-3xl md:text-5xl text-brand-base mb-4 tracking-tight">{t('reportFiling.title')}</h1>
          <p className="text-brand-muted text-lg max-w-xl mx-auto">{t('reportFiling.desc')}</p>
        </div>

        {!user && (
          <div className="flex items-start gap-4 p-5 mb-8 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 shadow-sm">
            <AlertTriangle size={24} className="shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold mb-1">Filing Anonymously</p>
              <p className="text-sm text-amber-700/80 leading-relaxed">
                {t('reportFiling.anonymousWarning') || 'You are submitting this report without an account.'} 
                <a href="/" className="text-amber-800 font-bold hover:underline mx-1">{t('reportFiling.login') || 'Log in'}</a> 
                {t('reportFiling.toTrack') || 'if you want to track the status later.'}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-brand-surface border border-brand-border rounded-3xl p-6 md:p-10 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dealer */}
            <div className="flex flex-col">
              <label className={labelCls} htmlFor="report-dealer"><Store size={16} className="text-slate-400"/> {t('reportFiling.dealerLabel')}</label>
              <select id="report-dealer" required className={`${inputCls} cursor-pointer`}
                value={form.dealer} onChange={e => setForm(f => ({ ...f, dealer: e.target.value }))}>
                <option value="">{t('reportFiling.selectDealer')}</option>
                {dealers.map(d => <option key={d.id} value={d.id}>{d.shop_name} — {d.license_number}</option>)}
              </select>
            </div>

            {/* Product */}
            <div className="flex flex-col">
              <label className={labelCls} htmlFor="report-product"><Package size={16} className="text-slate-400" /> {t('reportFiling.productLabel')}</label>
              <select id="report-product" className={`${inputCls} cursor-pointer text-brand-base`}
                value={form.product} onChange={e => setForm(f => ({ ...f, product: e.target.value }))}>
                <option value="">{t('reportFiling.selectProduct')}</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} — {p.brand}</option>)}
              </select>
            </div>
          </div>

          <hr className="border-brand-subtle" />

          {/* Category */}
          <div className="flex flex-col">
            <label className={labelCls} htmlFor="report-category"><AlertTriangle size={16} className="text-slate-400" /> {t('reportFiling.categoryLabel')}</label>
            <select id="report-category" required className={`${inputCls} cursor-pointer text-brand-base`}
              value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* Description */}
          <div className="flex flex-col">
            <label className={labelCls} htmlFor="report-desc"><FileText size={16} className="text-slate-400" /> {t('reportFiling.descLabel')}</label>
            <textarea id="report-desc" rows={6} required
              placeholder={t('reportFiling.descPlaceholder')}
              className={`${inputCls} resize-y leading-relaxed`}
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <div className="flex justify-between mt-2 px-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Minimum 20 characters</span>
              <span className={`text-[11px] font-bold ${form.description.length < 20 ? 'text-amber-500' : 'text-emerald-500'}`}>{form.description.length} {t('reportFiling.chars')}</span>
            </div>
          </div>

          <hr className="border-brand-subtle" />

          {/* Evidence */}
          <div className="flex flex-col">
            <label className={labelCls} htmlFor="report-image"><ImageIcon size={16} className="text-slate-400" /> {t('reportFiling.imageLabel')}</label>
            <label htmlFor="report-image"
              className="flex flex-col items-center justify-center gap-3 px-6 py-10 rounded-2xl border-2 border-dashed border-slate-300 bg-brand-bg text-brand-muted cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 hover:text-emerald-700 transition-all w-full group">
              <div className="w-12 h-12 bg-brand-surface rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Upload size={20} className="text-slate-400 group-hover:text-emerald-500" />
              </div>
              <div className="text-center">
                <p className="font-bold text-sm mb-1">{form.evidence_image ? form.evidence_image.name : (t('reportFiling.chooseImage') || 'Click to upload evidence')}</p>
                <p className="text-xs text-slate-400 font-medium">PNG, JPG, up to 10MB</p>
              </div>
            </label>
            <input id="report-image" type="file" accept="image/*" className="hidden"
              onChange={e => setForm(f => ({ ...f, evidence_image: e.target.files[0] }))} />
          </div>

          <div className="pt-4 mt-2 border-t border-brand-subtle">
            <button id="submit-report-btn" type="submit" disabled={loading}
              className="w-full py-4 px-8 rounded-xl bg-red-600 border border-transparent text-white font-bold text-base hover:bg-red-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {loading ? t('reportFiling.submitting') : (t('reportFiling.submitLabel') || 'Submit Official Complaint')}
            </button>
            <p className="text-center text-xs text-slate-400 mt-4 font-medium px-4">By submitting this report, you confirm that the information provided is accurate to the best of your knowledge.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
