import { Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'hi', label: 'हिं', name: 'Hindi' },
  { code: 'mr', label: 'मर', name: 'Marathi' },
  { code: 'pa', label: 'ਪੰ', name: 'Punjabi' },
];

export default function LanguageToggle() {
  const { user } = useAuth();
  const current = user?.preferred_language || localStorage.getItem('lang') || 'en';

  const handleChange = async (code) => {
    localStorage.setItem('lang', code);
    if (user) await api.patch('/users/me/', { preferred_language: code });
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-1 text-slate-500 text-xs">
      <Globe size={13} />
      {LANGUAGES.map(l => (
        <button key={l.code} id={`lang-btn-${l.code}`} title={l.name}
          onClick={() => handleChange(l.code)}
          className={`px-2 py-0.5 rounded text-xs font-medium transition-all
            ${current === l.code
              ? 'bg-green-400 text-white'
              : 'text-slate-500 hover:text-slate-200 hover:bg-[hsl(220,14%,16%)]'}`}>
          {l.label}
        </button>
      ))}
    </div>
  );
}
