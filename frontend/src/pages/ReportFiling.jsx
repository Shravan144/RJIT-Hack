import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { AlertTriangle, Upload, CheckCircle } from 'lucide-react';

const CATEGORIES = [
  { value: 'fake_product',    label: 'Fake / Adulterated Product' },
  { value: 'overpricing',     label: 'Overpricing' },
  { value: 'unlicensed',      label: 'Unlicensed Operation' },
  { value: 'expired_product', label: 'Selling Expired Product' },
  { value: 'wrong_advice',    label: 'Wrong Agronomic Advice' },
  { value: 'other',           label: 'Other' },
];

const inputCls = "w-full px-3.5 py-2.5 rounded-lg bg-[hsl(220,14%,16%)] border border-[hsl(220,14%,24%)] text-slate-100 text-sm outline-none focus:border-green-400 placeholder-slate-500 transition-all";

export default function ReportFiling() {
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
    if (!form.dealer) { toast.error('Please select a dealer.'); return; }
    if (form.description.length < 20) { toast.error('Description must be at least 20 characters.'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      await api.post('/reports/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSubmitted(true);
      toast.success('Report filed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit report.');
    } finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="bg-[hsl(220,16%,12%)] border border-[hsl(220,14%,24%)] rounded-2xl p-12 text-center max-w-md">
          <CheckCircle size={64} className="text-green-400 mx-auto mb-5" />
          <h2 className="font-display font-black text-2xl mb-3">Report Filed!</h2>
          <p className="text-slate-400 mb-7">Thank you for helping protect farmers. Our team will review your report within 48 hours.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button id="file-another-btn"
              className="px-5 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              onClick={() => { setSubmitted(false); setForm({ dealer: '', product: '', category: 'fake_product', description: '', evidence_image: null }); }}>
              File Another Report
            </button>
            <button id="view-dealers-btn"
              className="px-5 py-2.5 rounded-xl bg-[hsl(220,14%,16%)] border border-[hsl(220,14%,24%)] text-slate-300 font-semibold text-sm hover:border-green-400 hover:text-white transition-all"
              onClick={() => navigate('/dealers')}>
              Browse Dealers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 pb-20">
      <div className="mb-8">
        <h1 className="font-display font-black text-4xl text-slate-100 mb-2">File a Report</h1>
        <p className="text-slate-400">Report fraud, fake products, or unlicensed dealers. All reports are confidential.</p>
      </div>

      {!user && (
        <div className="flex items-center gap-2.5 px-4 py-3 mb-6 rounded-xl bg-amber-400/8 border border-amber-400/25 text-amber-400 text-sm">
          <AlertTriangle size={15} className="shrink-0" />
          You are filing anonymously. <a href="/" className="text-green-400 font-semibold hover:underline ml-1">Login</a> to track your report.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Dealer */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-400" htmlFor="report-dealer">Dealer *</label>
          <select id="report-dealer" required className={`${inputCls} cursor-pointer`}
            value={form.dealer} onChange={e => setForm(f => ({ ...f, dealer: e.target.value }))}>
            <option value="">Select a dealer...</option>
            {dealers.map(d => <option key={d.id} value={d.id}>{d.shop_name} — {d.license_number}</option>)}
          </select>
        </div>

        {/* Product */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-400" htmlFor="report-product">Product (optional)</label>
          <select id="report-product" className={`${inputCls} cursor-pointer`}
            value={form.product} onChange={e => setForm(f => ({ ...f, product: e.target.value }))}>
            <option value="">Select a product (optional)...</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name} — {p.brand}</option>)}
          </select>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-400" htmlFor="report-category">Category *</label>
          <select id="report-category" required className={`${inputCls} cursor-pointer`}
            value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-400" htmlFor="report-desc">Description *</label>
          <textarea id="report-desc" rows={5} required
            placeholder="Describe what happened in detail (at least 20 characters)..."
            className={`${inputCls} resize-y`}
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <span className="text-xs text-slate-600 text-right">{form.description.length} chars</span>
        </div>

        {/* Evidence */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-400" htmlFor="report-image">Evidence Image (optional)</label>
          <label htmlFor="report-image"
            className="flex items-center gap-2.5 px-4 py-3 rounded-lg border border-dashed border-[hsl(220,14%,24%)] text-slate-500 text-sm cursor-pointer hover:border-green-400 hover:text-slate-200 transition-all w-full">
            <Upload size={15} />
            {form.evidence_image ? form.evidence_image.name : 'Choose image...'}
          </label>
          <input id="report-image" type="file" accept="image/*" className="hidden"
            onChange={e => setForm(f => ({ ...f, evidence_image: e.target.files[0] }))} />
        </div>

        <button id="submit-report-btn" type="submit" disabled={loading}
          className="mt-2 py-3.5 px-7 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-base shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 transition-all self-start">
          {loading ? 'Submitting...' : '🚨 Submit Report'}
        </button>
      </form>
    </div>
  );
}
