import React from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useLanguage } from '@/contexts/LanguageContext';
import FilterBar from '@/components/FilterBar';
import KPICards from '@/components/KPICards';
import Globe3D from '@/components/Globe3D';
import StateFlagGrid from '@/components/StateFlagGrid';
import StateStackedAreaChart from '@/components/StateStackedAreaChart';
import CommodityStackedAreaChart from '@/components/CommodityStackedAreaChart';
import DualDonutSection from '@/components/DualDonutSection';
import TopRankings from '@/components/TopRankings';
import TrendDrillDown from '@/components/TrendDrillDown';
import DualTreeChart from '@/components/DualTreeChart';
import TopCountryBars from '@/components/TopCountryBars';
import { TrendingUp, Globe, BarChart3, MapPin, Package, Building2, Award, GitBranch, Flag } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="space-y-8">
      <FilterBar />

      {/* SECTION 1: KPI Cards */}
      <section>
        <SectionHeader title={t('tradeOverview')} description={t('tradeOverviewDesc')} icon={TrendingUp} />
        <KPICards data={filteredData} />
      </section>

      {/* SECTION 2: 3D Globe */}
      <section>
        <SectionHeader title={t('globalTradeMap')} description={t('globalTradeMapDesc')} icon={Globe} />
        <div className="chart-container p-0 overflow-hidden">
          <Globe3D data={filteredData} />
        </div>
      </section>

      {/* SECTION 3: Trade Trend Drill-Down */}
      <section>
        <SectionHeader title={t('tradeTrends')} description={t('tradeTrendsDesc')} icon={BarChart3} />
        <div className="chart-container">
          <TrendDrillDown data={filteredData} />
        </div>
      </section>

      {/* SECTION 4: Trade by State */}
      <section>
        <SectionHeader title={t('stateActivity')} description={t('stateActivityDesc')} icon={MapPin} />
        <div className="chart-container mb-4">
          <StateFlagGrid data={filteredData} />
        </div>
        <div className="chart-container">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {lang === 'bm' ? 'Graf Garis Komponen Mengikut Negeri' : 'Stacked Area Chart by State'}
          </h3>
          <StateStackedAreaChart data={filteredData} />
        </div>
      </section>

      {/* SECTION 5: Commodity Analysis */}
      <section>
        <SectionHeader
          title={lang === 'bm' ? 'Aliran Dagangan mengikut Komoditi' : 'Trade Flow by Commodity'}
          description={lang === 'bm' ? 'Evolusi dagangan mengikut kategori SITC sepanjang masa' : 'Evolution of trade by SITC category over time'}
          icon={Package}
        />
        <div className="chart-container">
          <CommodityStackedAreaChart data={filteredData} />
        </div>
      </section>

      {/* SECTION 6: Dual Hierarchical Tree Charts */}
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

      {/* SECTION 7: Enterprise Size + Region */}
      <section>
        <SectionHeader title={t('enterpriseParticipation')} description={t('enterpriseParticipationDesc')} icon={Building2} />
        <div className="chart-container">
          <DualDonutSection data={filteredData} />
        </div>
      </section>

      {/* SECTION 8: Top 10 Country Bars */}
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

      {/* SECTION 9: Commodity Treemap + Rankings */}
      <section>
        <SectionHeader title={t('topTradeRankings')} description={t('topTradeRankingsDesc')} icon={Award} />
        <div className="chart-container">
          <TopRankings data={filteredData} />
        </div>
      </section>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center py-6">
        <p className="text-sm font-semibold gradient-text">{t('storyEnd')}</p>
      </motion.div>
    </div>
  );
}
