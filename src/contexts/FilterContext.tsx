import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from 'react';
import { loadTradeData } from '@/data/tradeDataLoader';
import type { TradeRecord } from '@/data/tradeDataLoader';

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
  isLoading: boolean;
  uniqueNegeri: string[];
  uniqueKomoditi: string[];
  uniqueKeluasan: string[];
  uniqueYears: number[];
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [allData, setAllData] = useState<TradeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    tahun: 'all',
    bulan: 'all',
    jenisDagangan: 'all',
    negeri: 'all',
    komoditi: 'all',
    keluasan: 'all',
  });

  useEffect(() => {
    loadTradeData().then(data => {
      setAllData(data);
      setIsLoading(false);
    });
  }, []);

  const setFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Derive unique filter options from loaded data
  const uniqueNegeri = useMemo(() => [...new Set(allData.map(r => r.negeri))].sort(), [allData]);
  const uniqueKomoditi = useMemo(() => [...new Set(allData.map(r => r.komoditiUtama))].sort(), [allData]);
  const uniqueKeluasan = useMemo(() => [...new Set(allData.map(r => r.keluasanSyarikat))].sort(), [allData]);
  const uniqueYears = useMemo(() => [...new Set(allData.map(r => r.tahun))].sort((a, b) => a - b), [allData]);

  const filteredData = useMemo(() => {
    return allData.filter(r => {
      if (filters.tahun !== 'all' && r.tahun !== Number(filters.tahun)) return false;
      if (filters.bulan !== 'all' && r.bulan !== Number(filters.bulan)) return false;
      if (filters.jenisDagangan !== 'all' && r.jenisDagangan !== filters.jenisDagangan) return false;
      if (filters.negeri !== 'all' && r.negeri !== filters.negeri) return false;
      if (filters.komoditi !== 'all' && r.komoditiUtama !== filters.komoditi) return false;
      if (filters.keluasan !== 'all' && r.keluasanSyarikat !== filters.keluasan) return false;
      return true;
    });
  }, [filters, allData]);

  return (
    <FilterContext.Provider value={{ filters, setFilter, filteredData, allData, isLoading, uniqueNegeri, uniqueKomoditi, uniqueKeluasan, uniqueYears }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used within FilterProvider');
  return ctx;
}
