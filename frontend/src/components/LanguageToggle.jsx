import { Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'hi', label: 'हिं', name: 'Hindi' },
  { code: 'mr', label: 'मर', name: 'Marathi' },
  { code: 'pa', label: 'ਪੰ', name: 'Punjabi' },
];

export default function LanguageToggle() {
  const { user } = useAuth();
  const { i18n } = useTranslation();

  const current = i18n.language || 'en';

  const handleChange = async (code) => {
    try {
      // change language instantly
      i18n.changeLanguage(code);

      // save language locally
      localStorage.setItem('lang', code);

      // update backend preference
      if (user) {
        await api.patch('/users/me/', { preferred_language: code });
      }

    } catch (err) {
      console.error("Language change failed:", err);
    }
  };

  return (
    <div className="flex items-center gap-1 text-brand-muted text-xs">
      <Globe size={13} />

      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          id={`lang-btn-${l.code}`}
          title={l.name}
          onClick={() => handleChange(l.code)}
          className={`px-2 py-0.5 rounded text-xs font-medium transition-all
            ${
              current === l.code
                ? 'bg-green-400 text-white'
                : 'text-brand-muted hover:text-brand-base hover:bg-brand-elevated'
            }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}