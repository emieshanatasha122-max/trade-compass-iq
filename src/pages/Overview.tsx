import React from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useLanguage } from '@/contexts/LanguageContext';
import KPICards from '@/components/KPICards';
import Globe3D from '@/components/Globe3D';
import TrendDrillDown from '@/components/TrendDrillDown';
import StateFlagGrid from '@/components/StateFlagGrid';
import EnterpriseDonut from '@/components/EnterpriseDonut';
import DualTreeChart from '@/components/DualTreeChart';
import CommoditySunburst from '@/components/CommoditySunburst';
import TopCountryBars from '@/components/TopCountryBars';
import { TrendingUp, Globe, BarChart3, MapPin, Building2, GitBranch, Package, Flag } from 'lucide-react';

function SectionHeader({ title, description, icon: Icon }: { title: string; description: string; icon?: React.ElementType }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-primary" />}
        <h2 className="text-base font-bold text-foreground">{title}</h2>
      </div>
      <p className="section-description">{description}</p>
    </div>
  );
}

export default function Overview() {
  const { filteredData, isLoading } = useFilters();
  const { t, lang } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">{t('loadingData')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section A: KPI Cards */}
      <section>
        <SectionHeader title={t('tradeOverview')} description={t('tradeOverviewDesc')} icon={TrendingUp} />
        <KPICards data={filteredData} />
      </section>

      {/* Row: Section B (Trend) + Section C (Globe) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <SectionHeader title={t('tradeTrends')} description={t('tradeTrendsDesc')} icon={BarChart3} />
          <div className="chart-container">
            <TrendDrillDown data={filteredData} />
          </div>
        </section>

        <section>
          <SectionHeader title={t('globalTradeMap')} description={t('globalTradeMapDesc')} icon={Globe} />
          <div className="chart-container p-0 overflow-hidden">
            <Globe3D data={filteredData} />
          </div>
        </section>
      </div>

      {/* Section D: Trade by State (Full width bar chart) */}
      <section>
        <SectionHeader title={t('stateActivity')} description={t('stateActivityDesc')} icon={MapPin} />
        <div className="chart-container">
          <StateFlagGrid data={filteredData} />
        </div>
      </section>

      {/* Section E: Trade by Economic Area (Full width) */}
      <section>
        <SectionHeader
          title={lang === 'bm' ? 'Dagangan mengikut Kawasan Ekonomi' : 'Trade by Economic Region'}
          description={lang === 'bm' ? 'Hierarki dagangan mengikut kawasan ekonomi dan negeri.' : 'Trade hierarchy by economic region and state.'}
          icon={GitBranch}
        />
        <div className="chart-container">
          <DualTreeChart data={filteredData} />
        </div>
      </section>

      {/* Row: Section F (Company Pie) + Section G (Commodity Treemap) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <SectionHeader title={t('enterpriseParticipation')} description={t('enterpriseParticipationDesc')} icon={Building2} />
          <div className="chart-container">
            <EnterpriseDonut data={filteredData} />
          </div>
        </section>

        <section>
          <SectionHeader
            title={lang === 'bm' ? 'Peta Pokok Komoditi' : 'Commodity Treemap'}
            description={lang === 'bm' ? 'Taburan dagangan mengikut kategori SITC.' : 'Trade distribution by SITC category.'}
            icon={Package}
          />
          <div className="chart-container">
            <CommoditySunburst data={filteredData} />
          </div>
        </section>
      </div>

      {/* Section H: Top 10 Trading Countries */}
      <section>
        <SectionHeader
          title={lang === 'bm' ? '10 Negara Dagangan Teratas' : 'Top 10 Trading Countries'}
          description={lang === 'bm' ? 'Import (kiri) dan Eksport (kanan) mengikut negara.' : 'Import (left) and Export (right) by country.'}
          icon={Flag}
        />
        <div className="chart-container">
          <TopCountryBars data={filteredData} />
        </div>
      </section>
    </div>
  );
}
