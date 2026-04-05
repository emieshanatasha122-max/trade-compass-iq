import React, { useState } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useLanguage, ENTERPRISE_LABEL_MAP } from '@/contexts/LanguageContext';
import { Filter, ChevronDown, ChevronRight, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
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
          <div className="space-y-1 max-h-[180px] overflow-y-auto scrollbar-thin pr-1">
            {options.map(opt => (
              <label
                key={opt.value}
                className="flex items-center gap-2 py-1 px-1 rounded hover:bg-sidebar-accent/30 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={selected.includes(opt.value)}
                  onCheckedChange={() => onToggle(opt.value)}
                  className="h-3.5 w-3.5 border-sidebar-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-[11px] text-sidebar-foreground truncate">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SidebarFilters() {
  const { filters, toggleFilter, clearFilter, clearAllFilters, uniqueYears, uniqueNegeri, uniqueKawasanEkonomi, uniqueKeluasan } = useFilters();
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
          options={uniqueKawasanEkonomi.map(k => ({ value: k, label: k }))}
          selected={filters.kawasanEkonomi}
          onToggle={(v) => toggleFilter('kawasanEkonomi', v)}
          onClear={() => clearFilter('kawasanEkonomi')}
        />

        <FilterGroup
          title={t('enterpriseSize')}
          filterKey="keluasan"
          options={uniqueKeluasan
            .filter(k => k.toUpperCase() !== 'AGENTS')
            .map(k => ({
              value: k,
              label: ENTERPRISE_LABEL_MAP[k]?.[lang] || k,
            }))}
          selected={filters.keluasan}
          onToggle={(v) => toggleFilter('keluasan', v)}
          onClear={() => clearFilter('keluasan')}
        />
      </ScrollArea>
    </div>
  );
}
