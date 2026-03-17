import { Package, CheckCircle, XCircle, Tag } from 'lucide-react';
import { useTranslation } from "react-i18next";

const CATEGORY_BADGE = {
  pesticide:   'bg-red-50 border-red-200 text-red-700',
  fertilizer:  'bg-emerald-50 border-emerald-200 text-emerald-700',
  seed:        'bg-amber-50 border-amber-200 text-amber-700',
  herbicide:   'bg-purple-50 border-purple-200 text-purple-700',
  fungicide:   'bg-blue-50 border-blue-200 text-blue-700',
  equipment:   'bg-brand-bg border-brand-border text-brand-base',
  other:       'bg-brand-bg border-brand-border text-brand-base',
};

export default function ProductCard({ product, price, inStock }) {
  const { t } = useTranslation();
  const badge = CATEGORY_BADGE[product.category] || CATEGORY_BADGE.other;

  return (
    <div id={`product-card-${product.id}`}
      className="flex flex-col gap-3 bg-brand-surface border border-brand-border rounded-2xl p-4 hover:-translate-y-1 hover:shadow-lg hover:border-emerald-200 transition-all duration-300">

      <div className="flex justify-between items-center">
        <span className={`px-2.5 py-1 rounded-md border text-[10px] uppercase font-bold tracking-wider ${badge}`}>
          {t(`productSearch.${product.category}`)}
        </span>
        {inStock !== undefined && (
          <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide ${inStock ? 'text-emerald-600' : 'text-red-500'}`}>
            {inStock ? <CheckCircle size={12} /> : <XCircle size={12} />}
            {inStock ? t('components.inStock') : t('components.outOfStock')}
          </div>
        )}
      </div>

      <div className="flex justify-center py-5 bg-brand-bg rounded-xl border border-brand-subtle mt-1">
        <Package size={40} className="text-slate-300" />
      </div>

      <div className="mt-1">
        <h4 className="font-bold text-brand-base text-sm leading-snug line-clamp-2">{product.name}</h4>
        <p className="text-brand-muted text-xs mt-0.5">{product.brand}</p>
      </div>

      {product.active_ingredients && (
        <p className="text-slate-600 text-[11px] line-clamp-2 leading-relaxed">
          <span className="font-semibold text-slate-400 uppercase mr-1">{t('components.ai')}:</span>{product.active_ingredients}
        </p>
      )}

      <div className="flex flex-wrap gap-2 justify-between items-center pt-3 mt-auto border-t border-brand-subtle">
        {price && (
          <div className="flex items-center gap-1.5 text-sm font-black text-emerald-600">
            <Tag size={12} /> ₹{price}
          </div>
        )}
        {product.registration_number && (
          <div className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
            {t('components.reg')}: {product.registration_number}
          </div>
        )}
      </div>
    </div>
  );
}
