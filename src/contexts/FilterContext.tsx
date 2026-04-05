import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from 'react';
import { loadTradeData } from '@/data/tradeDataLoader';
import type { TradeRecord } from '@/data/tradeDataLoader';

interface FilterState {
  tahun: string[];
  bulan: string[];
  jenisDagangan: string[];
  negeri: string[];
  komoditi: string[];
  keluasan: string[];
  kawasanEkonomi: string[];
}

interface FilterContextType {
  filters: FilterState;
  toggleFilter: (key: keyof FilterState, value: string) => void;
  setFilterValues: (key: keyof FilterState, values: string[]) => void;
  clearFilter: (key: keyof FilterState) => void;
  clearAllFilters: () => void;
  filteredData: TradeRecord[];
  allData: TradeRecord[];
  isLoading: boolean;
  uniqueNegeri: string[];
  uniqueKomoditi: string[];
  uniqueKeluasan: string[];
  uniqueYears: number[];
  uniqueKawasanEkonomi: string[];
}

const emptyFilters: FilterState = {
  tahun: [],
  bulan: [],
  jenisDagangan: [],
  negeri: [],
  komoditi: [],
  keluasan: [],
  kawasanEkonomi: [],
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [allData, setAllData] = useState<TradeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({ ...emptyFilters });

  useEffect(() => {
    loadTradeData().then(data => {
      setAllData(data);
      setIsLoading(false);
    });
  }, []);

  const toggleFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      };
    });
  };

  const setFilterValues = (key: keyof FilterState, values: string[]) => {
    setFilters(prev => ({ ...prev, [key]: values }));
  };

  const clearFilter = (key: keyof FilterState) => {
    setFilters(prev => ({ ...prev, [key]: [] }));
  };

  const clearAllFilters = () => setFilters({ ...emptyFilters });

  const uniqueNegeri = useMemo(() => [...new Set(allData.map(r => r.negeri))].sort(), [allData]);
  const uniqueKomoditi = useMemo(() => [...new Set(allData.map(r => r.komoditiUtama))].sort(), [allData]);
  const uniqueKeluasan = useMemo(() => [...new Set(allData.map(r => r.keluasanSyarikat))].sort(), [allData]);
  const uniqueYears = useMemo(() => [...new Set(allData.map(r => r.tahun))].sort((a, b) => a - b), [allData]);
  const uniqueKawasanEkonomi = useMemo(() => [...new Set(allData.map(r => r.kawasanEkonomi).filter(Boolean))].sort(), [allData]);

  const filteredData = useMemo(() => {
    return allData.filter(r => {
      if (filters.tahun.length > 0 && !filters.tahun.includes(String(r.tahun))) return false;
      if (filters.bulan.length > 0 && !filters.bulan.includes(String(r.bulan))) return false;
      if (filters.jenisDagangan.length > 0 && !filters.jenisDagangan.includes(r.jenisDagangan)) return false;
      if (filters.negeri.length > 0 && !filters.negeri.includes(r.negeri)) return false;
      if (filters.komoditi.length > 0 && !filters.komoditi.includes(r.komoditiUtama)) return false;
      if (filters.keluasan.length > 0 && !filters.keluasan.includes(r.keluasanSyarikat)) return false;
      if (filters.kawasanEkonomi.length > 0 && !filters.kawasanEkonomi.includes(r.kawasanEkonomi)) return false;
      return true;
    });
  }, [filters, allData]);

  return (
    <FilterContext.Provider value={{
      filters, toggleFilter, setFilterValues, clearFilter, clearAllFilters,
      filteredData, allData, isLoading,
      uniqueNegeri, uniqueKomoditi, uniqueKeluasan, uniqueYears, uniqueKawasanEkonomi,
    }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used within FilterProvider');
  return ctx;
}
