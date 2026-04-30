import React, { useState } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Filter, ChevronDown, ChevronRight, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FilterGroupProps {
  title: string;
  filterKey: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
}

function FilterGroup({ title, options, selected, onToggle, onClear }: FilterGroupProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border-b border-sidebar-border last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          {title}
          {selected.length > 0 && (
            <span className="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {selected.length}
            </span>
          )}
        </span>
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>

      {open && (
        <div className="px-4 pb-3">
          {selected.length > 0 && (
            <button
              onClick={onClear}
              className="text-[10px] text-primary hover:underline mb-1.5 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
          <div className="flex flex-wrap gap-2">
            {options.map(opt => {
              const isActive = selected.includes(opt.value);

              return (
                <button
                  key={opt.value}
                  onClick={() => onToggle(opt.value)}
                  className={`px-3 py-1 rounded-full text-[11px] border transition
                    ${isActive
                      ? 'bg-primary text-white border-primary'
                      : 'border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent/40'
                    }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SidebarFilters() {
  const { filters, toggleFilter, clearFilter, clearAllFilters, uniqueYears, uniqueNegeri, uniqueKawasanEkonomi } = useFilters();
  const { t, lang } = useLanguage();

  const hasAnyFilter = Object.values(filters).some(arr => arr.length > 0);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-sidebar-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-sidebar-accent-foreground">{t('filters')}</span>
        </div>
        {hasAnyFilter && (
          <button
            onClick={clearAllFilters}
            className="text-[10px] text-primary hover:underline"
          >
            {lang === 'bm' ? 'Reset Semua' : 'Reset All'}
          </button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <FilterGroup
          title={t('year')}
          filterKey="tahun"
          options={uniqueYears.map(y => ({ value: String(y), label: String(y) }))}
          selected={filters.tahun}
          onToggle={(v) => toggleFilter('tahun', v)}
          onClear={() => clearFilter('tahun')}
        />

        <FilterGroup
          title={t('tradeType')}
          filterKey="jenisDagangan"
          options={[
            { value: 'Eksport', label: t('export') },
            { value: 'Import', label: t('import') },
          ]}
          selected={filters.jenisDagangan}
          onToggle={(v) => toggleFilter('jenisDagangan', v)}
          onClear={() => clearFilter('jenisDagangan')}
        />

        <FilterGroup
          title={t('state')}
          filterKey="negeri"
          options={uniqueNegeri.map(n => ({ value: n, label: n }))}
          selected={filters.negeri}
          onToggle={(v) => toggleFilter('negeri', v)}
          onClear={() => clearFilter('negeri')}
        />

        <FilterGroup
          title={lang === 'bm' ? 'Kawasan Ekonomi' : 'Economic Area'}
          filterKey="kawasanEkonomi"
          options={[
                   { value: 'AFTA', label: 'A.F.T.A' },
                   { value: 'NAFTA', label: 'N.A.F.T.A' },
                   { value: 'EU', label: 'E.U.' },
                  ]}
          selected={filters.kawasanEkonomi}
          onToggle={(v) => toggleFilter('kawasanEkonomi', v)}
          onClear={() => clearFilter('kawasanEkonomi')}
        />

      </ScrollArea>
    </div>
  );
}