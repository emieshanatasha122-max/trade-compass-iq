import React from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useLanguage } from '@/contexts/LanguageContext';
import KPICards from '@/components/KPICards';
import Globe3D from '@/components/Globe3D';
import TrendDrillDown from '@/components/TrendDrillDown';
import StateFlagGrid from '@/components/StateFlagGrid';
import DualTreeChart from '@/components/EconomicRegionCards';
import CommoditySunburst from '@/components/CommoditySunburst';
import TopCountryBars from '@/components/TopCountryBars';
import {
  Globe,
  BarChart3,
  MapPin,
  GitBranch,
  Package,
  Flag,
} from 'lucide-react';

function SectionHeader({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-primary" />}
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
      <div className="flex h-[60vh] items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-3 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">{t('loadingData')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* OVERVIEW BLOCK */}
      <section
        id="overview-top"
        className="relative overflow-hidden rounded-2xl border border-border bg-card"
      >
        {/* Wallpaper light */}
        <div
          className="absolute inset-0 block bg-cover bg-center bg-no-repeat dark:hidden"
          style={{ backgroundImage: "url('/cargo-light.png')" }}
        />

        {/* Wallpaper dark */}
        <div
          className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat dark:block"
          style={{ backgroundImage: "url('/globe-dark.png')" }}
        />

        {/* Overlay light */}
        <div className="absolute inset-0 block bg-gradient-to-r from-white/80 via-white/55 to-white/10 dark:hidden" />

        {/* Overlay dark */}
        <div className="absolute inset-0 hidden dark:block bg-[linear-gradient(90deg,rgba(4,10,28,0.92)_0%,rgba(8,18,44,0.78)_45%,rgba(8,18,44,0.38)_100%)]" />

        {/* Soft glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-10 top-0 h-40 w-60 bg-cyan-400/10 blur-3xl dark:bg-cyan-500/10" />
          <div className="absolute right-0 top-0 h-40 w-60 bg-violet-400/10 blur-3xl dark:bg-violet-500/10" />
          <div className="absolute bottom-0 left-1/3 h-24 w-48 bg-blue-400/10 blur-3xl dark:bg-sky-500/10" />
        </div>

        <div className="relative z-10 px-6 py-6 md:px-8 md:py-8">
          <div className="grid items-center gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm">
                {lang === 'bm' ? 'Overview' : 'Overview'}
              </div>

              <div className="space-y-3">
                <h1 className="max-w-3xl text-[28px] font-black leading-[1.08] tracking-[-0.02em] md:text-[42px]">
                  {lang === 'bm' ? (
                    <>
                      <span className="block text-slate-900 dark:text-white">
                        Perdagangan Malaysia
                      </span>
                      <span className="block text-slate-900 dark:text-white">
                        kekal
                        <span className="bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-500 bg-clip-text pl-3 text-transparent">
                          kukuh dan kompetitif
                        </span>
                      </span>
                      <span className="block text-slate-900 dark:text-white">
                        pada tahun 2026.
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="block text-slate-900 dark:text-white">
                        Malaysia’s Trade
                      </span>
                      <span className="block text-slate-900 dark:text-white">
                        remains
                        <span className="bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-500 bg-clip-text pl-3 text-transparent">
                          strong and competitive
                        </span>
                      </span>
                      <span className="block text-slate-900 dark:text-white">
                        in 2026.
                      </span>
                    </>
                  )}
                </h1>

                <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
                  {lang === 'bm'
                    ? 'Peningkatan eksport didorong oleh komoditi elektronik dan permintaan global yang berdaya tahan, manakala import terus menyokong pertumbuhan industri domestik.'
                    : 'Export growth is driven by electronics commodities and resilient global demand, while imports continue to support domestic industrial expansion.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="rounded-full border border-border bg-background/60 px-3 py-1.5 backdrop-blur-sm">
                  {lang === 'bm' ? 'Data sehingga Februari 2026' : 'Data up to February 2026'}
                </span>
              </div>
            </div>

            <div className="hidden md:block" />
          </div>

          <div className="mt-8 space-y-4">
            <KPICards data={filteredData} />
          </div>
        </div>
      </section>

      {/* SECTION A */}
      <section id="dashboard-sections">
        <SectionHeader
          title={t('tradeTrends')}
          description={t('tradeTrendsDesc')}
          icon={BarChart3}
        />
        <div className="chart-container">
          <TrendDrillDown data={filteredData} />
        </div>
      </section>

      {/* SECTION B */}
      <section>
        <SectionHeader
          title={t('globalTradeMap')}
          description={t('globalTradeMapDesc')}
          icon={Globe}
        />
        <div className="chart-container overflow-hidden p-0">
          <Globe3D data={filteredData} />
        </div>
      </section>

      {/* SECTION C */}
      <section>
        <SectionHeader
          title={t('stateActivity')}
          description={t('stateActivityDesc')}
          icon={MapPin}
        />
        <div className="chart-container">
          <StateFlagGrid data={filteredData} />
        </div>
      </section>

      {/* SECTION D */}
      <section>
        <SectionHeader
          title={lang === 'bm' ? 'Komoditi Perdagangan' : 'Commodity Trade'}
          description={
            lang === 'bm'
              ? 'Taburan perdagangan mengikut kategori komoditi.'
              : 'Trade distribution by commodity category.'
          }
          icon={Package}
        />
        <div className="chart-container">
          <CommoditySunburst data={filteredData} />
        </div>
      </section>

      {/* SECTION E & F */}
      <section>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div>
            <SectionHeader
              title={lang === 'bm' ? 'Perdagangan mengikut Kawasan Ekonomi' : 'Trade by Economic Region'}
              description={
                lang === 'bm'
                  ? 'Hierarki perdagangan mengikut kawasan ekonomi dan negeri.'
                  : 'Trade hierarchy by economic region and state.'
              }
              icon={GitBranch}
            />
            <div className="chart-container h-full">
              <DualTreeChart data={filteredData} />
            </div>
          </div>

          <div>
            <SectionHeader
              title={lang === 'bm' ? '10 Negara Perdagangan Teratas' : 'Top 10 Trading Countries'}
              description={
                lang === 'bm'
                  ? 'Import dan eksport mengikut negara.'
                  : 'Import and export by country.'
              }
              icon={Flag}
            />
            <div className="chart-container h-full">
              <TopCountryBars data={filteredData} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}