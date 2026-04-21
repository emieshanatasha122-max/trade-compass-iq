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

{/* Floating Navigation */}
<div className="sticky top-2 z-50 flex justify-center">
  <div className="flex gap-2 rounded-full border border-border/50 bg-background/80 p-1 backdrop-blur">
    
    {/* Overview Button */}
    <button
      onClick={() => document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' })}
      className="rounded-full px-4 py-1.5 text-sm font-medium hover:bg-muted"
    >
      Overview
    </button>

    {/* Dashboard Button */}
    <button
      onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })}
      className="rounded-full px-4 py-1.5 text-sm font-medium hover:bg-muted"
    >
      Dashboard
    </button>

  </div>
</div>

      {/* Hero Section */}
      <section
        id="overview"
        className="relative overflow-hidden rounded-3xl border border-border/50 bg-card px-8 py-10 md:px-10 md:py-12"
      >
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              {lang === 'bm' ? 'Overview' : 'Overview'}
            </p>

            <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl">
              {lang === 'bm'
                ? 'Prestasi Perdagangan Malaysia kekal kukuh dan kompetitif pada tahun 2026.'
                : 'Malaysia Trade Performance remains strong and competitive in 2026.'}
            </h1>

            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              {lang === 'bm'
                ? 'Sektor elektronik terus menjadi pemacu utama eksport, manakala import menyokong pertumbuhan industri domestik dan keperluan rantaian bekalan.'
                : 'The electronics sector continues to drive exports, while imports support domestic industrial growth and supply chain needs.'}
            </p>

            <p className="text-sm text-muted-foreground">
              {lang === 'bm'
                ? 'Data sehingga Februari 2026'
                : 'Data as of February 2026'}
            </p>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative h-[260px] w-full overflow-hidden rounded-3xl border border-border/50 bg-muted/20 md:h-[320px]">
              {/* Light Mode - Cargo */}
              <img
                src="/images/cargo-light.png"
                alt="Trade logistics visual"
                className="block h-full w-full object-cover dark:hidden"
              />

              {/* Dark Mode - Globe */}
              <img
                src="/images/globe-dark.png"
                alt="Global trade earth visual"
                className="hidden h-full w-full object-cover dark:block"
              />
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section id="dashboard">
        <KPICards data={filteredData} />
      </section>

      {/* Section B: Trend Analysis (Full Width) */}
      <section>
        <SectionHeader title={t('tradeTrends')} description={t('tradeTrendsDesc')} icon={BarChart3} />
        <div className="chart-container">
          <TrendDrillDown data={filteredData} />
        </div>
      </section>

      {/* Section C: Global Trade Map (Full Width) */}
      <section>
        <SectionHeader title={t('globalTradeMap')} description={t('globalTradeMapDesc')} icon={Globe} />
        <div className="chart-container p-0 overflow-hidden">
          <Globe3D data={filteredData} />
        </div>
      </section>

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
          title={lang === 'bm' ? 'Perdagangan mengikut Kawasan Ekonomi' : 'Trade by Economic Region'}
          description={lang === 'bm' ? 'Hierarki Perdagangan mengikut kawasan ekonomi dan negeri.' : 'Trade hierarchy by economic region and state.'}
          icon={GitBranch}
        />
        <div className="chart-container">
          <DualTreeChart data={filteredData} />
        </div>
      </section>

      {/* Section F: Trade Commodities (Full Width, on top) */}
      <section>
        <SectionHeader
          title={lang === 'bm' ? 'Komoditi Perdagangan' : 'Trade Commodities'}
          description={lang === 'bm' ? 'Taburan Perdagangan mengikut kategori komoditi.' : 'Trade distribution by commodity category.'}
          icon={Package}
        />
        <div className="chart-container">
          <CommoditySunburst data={filteredData} />
        </div>
      </section>

      {/* Section G: Business Participation (Full Width, below) */}
      <section>
        <SectionHeader
          title={lang === 'bm' ? 'Penyertaan Syarikat Perniagaan' : 'Business Participation'}
          description={lang === 'bm' ? 'Bahagian ini menunjukkan bagaimana syarikat pelbagai saiz mengambil bahagian dalam Perdagangan.' : 'This section shows how companies of different sizes participate in trade.'}
          icon={Building2}
        />
        <div className="chart-container">
          <EnterpriseDonut data={filteredData} />
        </div>
      </section>

      {/* Section H: Top 10 Trading Countries */}
      <section>
        <SectionHeader
          title={lang === 'bm' ? '10 Negara Perdagangan Teratas' : 'Top 10 Trading Countries'}
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
