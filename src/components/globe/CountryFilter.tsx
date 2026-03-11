import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';

interface CountryOption {
  code: string;
  name: string;
}

interface CountryFilterProps {
  countries: CountryOption[];
  selected: string | null;
  onSelect: (code: string | null) => void;
  lang: 'bm' | 'en';
}

export default function CountryFilter({ countries, selected, onSelect, lang }: CountryFilterProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = countries.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const selectedName = countries.find(c => c.code === selected)?.name;

  return (
    <div ref={ref} className="absolute bottom-3 left-3 z-20 w-56">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-card/90 backdrop-blur-sm border border-border text-xs text-foreground hover:bg-accent transition-colors"
      >
        <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        <span className="truncate flex-1 text-left">
          {selected ? selectedName : (lang === 'bm' ? 'Cari Negara...' : 'Search Country...')}
        </span>
        {selected && (
          <span
            onClick={e => { e.stopPropagation(); onSelect(null); }}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            ✕
          </span>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full mb-1 left-0 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-secondary/50">
              <Search className="w-3 h-3 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={lang === 'bm' ? 'Taip nama negara...' : 'Type country name...'}
                className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none flex-1"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="p-3 text-xs text-muted-foreground text-center">
                {lang === 'bm' ? 'Tiada keputusan' : 'No results'}
              </p>
            )}
            {filtered.map(c => (
              <button
                key={c.code}
                onClick={() => { onSelect(c.code); setOpen(false); setSearch(''); }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-accent transition-colors flex items-center gap-2 ${
                  selected === c.code ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                }`}
              >
                <MapPin className="w-3 h-3 flex-shrink-0" />
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
