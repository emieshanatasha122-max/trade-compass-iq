import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { tradeData, TradeRecord } from '@/data/mockTradeData';

interface FilterState {
  tahun: string;
  bulan: string;
  jenisDagangan: string;
  negeri: string;
  komoditi: string;
  keluasan: string;
}

interface FilterContextType {
  filters: FilterState;
  setFilter: (key: keyof FilterState, value: string) => void;
  filteredData: TradeRecord[];
  allData: TradeRecord[];
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>({
    tahun: 'all',
    bulan: 'all',
    jenisDagangan: 'all',
    negeri: 'all',
    komoditi: 'all',
    keluasan: 'all',
  });

  const setFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredData = useMemo(() => {
    return tradeData.filter(r => {
      if (filters.tahun !== 'all' && r.tahun !== Number(filters.tahun)) return false;
      if (filters.bulan !== 'all' && r.bulan !== Number(filters.bulan)) return false;
      if (filters.jenisDagangan !== 'all' && r.jenisDagangan !== filters.jenisDagangan) return false;
      if (filters.negeri !== 'all' && r.negeri !== filters.negeri) return false;
      if (filters.komoditi !== 'all' && r.komoditiUtama !== filters.komoditi) return false;
      if (filters.keluasan !== 'all' && r.keluasanSyarikat !== filters.keluasan) return false;
      return true;
    });
  }, [filters]);

  return (
    <FilterContext.Provider value={{ filters, setFilter, filteredData, allData: tradeData }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used within FilterProvider');
  return ctx;
}
