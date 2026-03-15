import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from "react-i18next";

export default function SearchBar({ placeholder, onSearch, filters, onFilterChange }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <div className="w-full">
      <form className="flex flex-wrap items-center gap-2.5" onSubmit={handleSubmit} id="search-form">
        <div className="flex items-center flex-1 min-w-60 bg-[hsl(220,14%,16%)] border border-[hsl(220,14%,24%)] rounded-lg focus-within:border-green-400 transition-all">
          <Search className="mx-3 text-slate-500 shrink-0" size={17} />
          <input
            id="search-input"
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-slate-100 text-sm py-2.5 placeholder-slate-500"
            placeholder={placeholder || t('components.searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" id="search-btn"
            className="m-1 px-4 py-1.5 rounded-md bg-gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            {t('components.searchBtn')}
          </button>
        </div>

        {filters && (
          <button type="button" id="filter-toggle-btn"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[hsl(220,14%,16%)] border border-[hsl(220,14%,24%)] text-slate-400 text-sm font-medium hover:text-slate-100 hover:border-green-400 transition-all"
            onClick={() => setShowFilters(s => !s)}>
            <SlidersHorizontal size={15} /> {t('components.filtersBtn')}
          </button>
        )}
      </form>

      {showFilters && filters && (
        <div className="mt-3 flex flex-wrap gap-3 bg-[hsl(220,14%,16%)] border border-[hsl(220,14%,24%)] rounded-xl p-4">
          {filters.map((f) => (
            <div key={f.key} className="flex flex-col gap-1 min-w-44">
              <label className="text-xs font-medium text-slate-500">{f.label}</label>
              <select
                id={`filter-${f.key}`}
                className="px-3 py-2 rounded-lg bg-[hsl(220,12%,18%)] border border-[hsl(220,14%,24%)] text-slate-200 text-sm outline-none focus:border-green-400 transition-all cursor-pointer"
                onChange={(e) => onFilterChange?.(f.key, e.target.value)}>
                <option value="">{t('components.allOption')}</option>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
