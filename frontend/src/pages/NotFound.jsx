import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="font-display font-black text-[8rem] leading-none gradient-text">404</div>
        <h2 className="font-bold text-2xl text-brand-base mt-3 mb-2">{t('notFound.title')}</h2>
        <p className="text-brand-muted mb-8">{t('notFound.desc')}</p>
        <button id="go-home-btn"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-white font-semibold hover:-translate-y-0.5 hover:shadow-glow transition-all"
          onClick={() => navigate('/')}>
          <Home size={16} /> {t('notFound.goHome')}
        </button>
      </div>
    </div>
  );
}
