import { Package, CheckCircle, XCircle, Tag } from 'lucide-react';
import { useTranslation } from "react-i18next";

const CATEGORY_BADGE = {
  pesticide:   'bg-red-400/10 border-red-400/20 text-red-400',
  fertilizer:  'bg-green-400/10 border-green-400/20 text-green-400',
  seed:        'bg-amber-400/10 border-amber-400/20 text-amber-400',
  herbicide:   'bg-purple-400/10 border-purple-400/20 text-purple-400',
  fungicide:   'bg-blue-400/10 border-blue-400/20 text-blue-400',
  equipment:   'bg-slate-600/20 border-slate-500/20 text-slate-400',
  other:       'bg-slate-700/20 border-slate-600/20 text-slate-500',
};

export default function ProductCard({ product, price, inStock }) {
  const { t } = useTranslation();
  const badge = CATEGORY_BADGE[product.category] || CATEGORY_BADGE.other;

  return (
    <div id={`product-card-${product.id}`}
      className="flex flex-col gap-2.5 bg-gradient-card border border-[hsl(220,14%,20%)] rounded-2xl p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">

      <div className="flex justify-between items-center">
        <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold capitalize ${badge}`}>
          {t(`productSearch.${product.category}`)}
        </span>
        {inStock !== undefined && (
          <div className={`flex items-center gap-1 text-[11px] font-semibold ${inStock ? 'text-green-400' : 'text-red-400'}`}>
            {inStock ? <CheckCircle size={11} /> : <XCircle size={11} />}
            {inStock ? t('components.inStock') : t('components.outOfStock')}
          </div>
        )}
      </div>

      <div className="flex justify-center py-3">
        <Package size={32} className="text-slate-600" />
      </div>

      <h4 className="font-bold text-slate-100 text-sm leading-snug">{product.name}</h4>
      <p className="text-slate-400 text-xs">{product.brand}</p>

      {product.active_ingredients && (
        <p className="text-slate-500 text-[11px] line-clamp-2">{t('components.ai')}: {product.active_ingredients}</p>
      )}

      <div className="flex justify-between items-center pt-2 border-t border-[hsl(220,14%,20%)] mt-auto">
        {price && (
          <div className="flex items-center gap-1 text-sm font-bold text-green-400">
            <Tag size={11} /> ₹{price}
          </div>
        )}
        {product.registration_number && (
          <div className="text-[11px] text-slate-500">{t('components.reg')}: {product.registration_number}</div>
        )}
      </div>
    </div>
  );
}
