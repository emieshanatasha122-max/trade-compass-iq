import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Newspaper,
} from 'lucide-react';

const statsLatest = [
  {
    titleBm: 'Statistik Eksport Import Mengikut Negeri, Januari 2026',
    titleEn: 'Export Import Statistics by State, January 2026',
    monthBm: 'Januari',
    monthEn: 'January',
    year: 2026,
    coverBm: '/covers/infografik-stats-bm-2026-jan.png',
    coverEn: '/covers/infografik-stats-bi-2026-jan.png',
    Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-january-2026',
  },
  {
    titleBm: 'Statistik Eksport Import Mengikut Negeri, Februari 2026',
    titleEn: 'Export Import Statistics by State, February 2026',
    monthBm: 'Februari',
    monthEn: 'February',
    year: 2026,
    coverBm: '/covers/infografik-stats-bm-2026-feb.png',
    coverEn: '/covers/infografik-stats-bi-2026-feb.png',
    Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-feb2026',
  },
  {
    titleBm: 'Statistik Eksport Import Mengikut Negeri, Mac 2026',
    titleEn: 'Export Import Statistics by State, March 2026',
    monthBm: 'Mac',
    monthEn: 'March',
    year: 2026,
    coverBm: '/covers/infografik-stats-bm-2026-mac.png',
    coverEn: '/covers/infografik-stats-bi-2026-mac.png',
    Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-mar2026',
  },
];

const statsArchiveItems: Record<
  number,
  {
    titleBm: string;
    titleEn: string;
    Url: string;

  }[]
> = {
  2025: [
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, Januari 2025',
      titleEn: 'Export Import Statistics by State, January 2025',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-january-2025',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, Februari 2025',
      titleEn: 'Export Import Statistics by State, February 2025',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-february-2025',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, Mac 2025',
      titleEn: 'Export Import Statistics by State, March 2025',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-march-2025',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, April 2025',
      titleEn: 'Export Import Statistics by State, April 2025',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-april-2025',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, Mei 2025',
      titleEn: 'Export Import Statistics by State, May 2025',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-may-2025',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, Jun 2025',
      titleEn: 'Export Import Statistics by State, June 2025',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-june-2025',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, Julai 2025',
      titleEn: 'Export Import Statistics by State, July 2025',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-july-2025',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, Ogos 2025',
      titleEn: 'Export Import Statistics by State, August 2025',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-august-2025',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, September 2025',
      titleEn: 'Export Import Statistics by State, September 2025',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-september-2025',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, Oktober 2025',
      titleEn: 'Export Import Statistics by State, October 2025',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-october-2025',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, November 2025',
      titleEn: 'Export Import Statistics by State, November 2025',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-november-2025',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, Disember 2025',
      titleEn: 'Export Import Statistics by State, December 2025',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-december-2025',
    },
  ],
  2024: [
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, Januari 2024',
      titleEn: 'Export Import Statistics by State, January 2024',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-jan2024',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, Februari 2024',
      titleEn: 'Export Import Statistics by State, February 2024',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-feb2024',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, Mac 2024',
      titleEn: 'Export Import Statistics by State, March 2024',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-mar2024-',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, April 2024',
      titleEn: 'Export Import Statistics by State, April 2024',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-apr2024-',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, Mei 2024',
      titleEn: 'Export Import Statistics by State, May 2024',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-may2024-',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, Jun 2024',
      titleEn: 'Export Import Statistics by State, June 2024',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-jun2024-',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, Julai 2024',
      titleEn: 'Export Import Statistics by State, July 2024',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-jul2024-',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, Ogos 2024',
      titleEn: 'Export Import Statistics by State, August 2024',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-aug2024-',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, September 2024',
      titleEn: 'Export Import Statistics by State, September 2024',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-sep2024-',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, Oktober 2024',
      titleEn: 'Export Import Statistics by State, October 2024',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-oct2024-',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, November 2024',
      titleEn: 'Export Import Statistics by State, November 2024',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-nov2024-',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, Disember 2024',
      titleEn: 'Export Import Statistics by State, December 2024',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-december-2024',
    },
  ],
  2023: [
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, Januari 2023',
      titleEn: 'Export Import Statistics by State, January 2023',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/7677e5e4-841f-11ed-96a6-1866daa77ef9',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, Februari 2023',
      titleEn: 'Export Import Statistics by State, February 2023',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/a79348d2-841f-11ed-96a6-1866daa77ef9',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, April 2023',
      titleEn: 'Export Import Statistics by State, April 2023',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/dc35ffe8-841f-11ed-96a6-1866daa77ef9',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, Mei 2023',
      titleEn: 'Export Import Statistics by State, May 2023',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/fa145dd7-841f-11ed-96a6-1866daa77ef9',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, Jun 2023',
      titleEn: 'Export Import Statistics by State, June 2023',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/1e02f969-8420-11ed-96a6-1866daa77ef9',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, Julai 2023',
      titleEn: 'Export Import Statistics by State, July 2023',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/35b0ce9b-8420-11ed-96a6-1866daa77ef9',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, Ogos 2023',
      titleEn: 'Export Import Statistics by State, August 2023',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-august-2023',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, September 2023',
      titleEn: 'Export Import Statistics by State, September 2023',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-sep-2023',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, Oktober 2023',
      titleEn: 'Export Import Statistics by State, October 2023',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-oct-2023',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, November 2023',
      titleEn: 'Export Import Statistics by State, November 2023',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-nov-2023',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, Disember 2023',
      titleEn: 'Export Import Statistics by State, December 2023',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/export-import-statistics-by-state-december-',
    },
  ],
  2022: [
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, November 2022',
      titleEn: 'Export Import Statistics by State, November 2022',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/1d81a3ea-8112-11ed-80ec-0cc47a9b694a',
    },
    {
      titleBm: 'Statistik Eksport Import Mengikut Negeri, Disember 2022',
      titleEn: 'Export Import Statistics by State, December 2022',
      Url: 'https://www.dosm.gov.my/portal-main/release-content/5009e3c9-841f-11ed-96a6-1866daa77ef9',
    },
  ],
};

const statsYears = [
  {
    year: 2026,
    availabilityBm: '3 bulan tersedia',
    availabilityEn: '3 months available',
  },
  {
    year: 2025,
    availabilityBm: '12 bulan tersedia',
    availabilityEn: '12 months available',
  },
  {
    year: 2024,
    availabilityBm: '12 bulan tersedia',
    availabilityEn: '12 months available',
  },
  {
    year: 2023,
    availabilityBm: '12 bulan tersedia',
    availabilityEn: '12 months available',
  },
  {
    year: 2022,
    availabilityBm: 'Disember tersedia',
    availabilityEn: 'December available',
  },
];

const books = [
  {
    title: 'Statistik Perdagangan Malaysia Mengikut Negeri 2020',
    year: 2020,
    file: '/books/2020/statistik-perdagangan-malaysia-negeri-2020.pdf',
    cover: '/covers/cover-2020.png',
  },
  {
    title: 'Statistik Perdagangan Malaysia Mengikut Negeri 2021',
    year: 2021,
    file: '/books/2021/statistik-perdagangan-malaysia-negeri-2021.pdf',
    cover: '/covers/cover-2021.png',
  },
  {
    title: 'Statistik Perdagangan Malaysia Mengikut Negeri 2022',
    year: 2022,
    file: '/books/2022/statistik-perdagangan-malaysia-negeri-2022.pdf',
    cover: '/covers/cover-2022.png',
  },
  {
    title: 'Statistik Perdagangan Malaysia Mengikut Negeri 2023',
    year: 2023,
    file: '/books/2023/statistik-perdagangan-malaysia-negeri-2023.pdf',
    cover: '/covers/cover-2023.png',
  },
  {
    title: 'Statistik Perdagangan Malaysia Mengikut Negeri 2024',
    year: 2024,
    file: '/books/2024/statistik-perdagangan-malaysia-negeri-2024.pdf',
    cover: '/covers/cover-2024.png',
  },
  {
    title: 'Statistik Perdagangan Malaysia Mengikut Negeri 2025 (Negeri Sembilan)',
    year: 2025,
    state: 'Negeri Sembilan',
    file: '/books/2025/statistik-perdagangan-malaysia-negeri-2025-negeri-sembilan.pdf',
    cover: '/covers/cover-2025-negeri-sembilan.png',
  },
  {
    title: 'Statistik Perdagangan Malaysia Mengikut Negeri 2025 (Selangor)',
    year: 2025,
    state: 'Selangor',
    file: '/books/2025/statistik-perdagangan-malaysia-negeri-2025-selangor.pdf',
    cover: '/covers/cover-2025-selangor.png',
  },
  {
    title: 'Statistik Perdagangan Malaysia Mengikut Negeri 2025 (Kedah)',
    year: 2025,
    state: 'Kedah',
    file: '/books/2025/statistik-perdagangan-malaysia-negeri-2025-kedah.pdf',
    cover: '/covers/cover-2025-kedah.png',
  },
  {
    title: 'Statistik Perdagangan Malaysia Mengikut Negeri 2025 (Pahang)',
    year: 2025,
    state: 'Pahang',
    file: '/books/2025/statistik-perdagangan-malaysia-negeri-2025-pahang.pdf',
    cover: '/covers/cover-2025-pahang.png',
  },
  {
    title: 'Statistik Perdagangan Malaysia Mengikut Negeri 2025 (Perak)',
    year: 2025,
    state: 'Perak',
    file: '/books/2025/statistik-perdagangan-malaysia-negeri-2025-perak.pdf',
    cover: '/covers/cover-2025-perak.png',
  },
  {
    title: 'Statistik Perdagangan Malaysia Mengikut Negeri 2025 (Perlis)',
    year: 2025,
    state: 'Perlis',
    file: '/books/2025/statistik-perdagangan-malaysia-negeri-2025-perlis.pdf',
    cover: '/covers/cover-2025-perlis.png',
  },
  {
    title: 'Statistik Perdagangan Malaysia Mengikut Negeri 2025 (Pulau Pinang)',
    year: 2025,
    state: 'Pulau Pinang',
    file: '/books/2025/statistik-perdagangan-malaysia-negeri-2025-pulau-pinang.pdf',
    cover: '/covers/cover-2025-pulau-pinang.png',
  },
  {
    title: 'Statistik Perdagangan Malaysia Mengikut Negeri 2025 (Sabah)',
    year: 2025,
    state: 'Sabah',
    file: '/books/2025/statistik-perdagangan-malaysia-negeri-2025-sabah.pdf',
    cover: '/covers/cover-2025-sabah.png',
  },
  {
    title: 'Statistik Perdagangan Malaysia Mengikut Negeri 2025 (Sarawak)',
    year: 2025,
    state: 'Sarawak',
    file: '/books/2025/statistik-perdagangan-malaysia-negeri-2025-sarawak.pdf',
    cover: '/covers/cover-2025-sarawak.png',
  },
    {
    title: 'Statistik Perdagangan Malaysia Mengikut Negeri 2025 (Terengganu)',
    year: 2025,
    state: 'Terengganu',
    file: '/books/2025/statistik-perdagangan-malaysia-negeri-2025-terengganu.pdf',
    cover: '/covers/cover-2025-terengganu.png',
  },
    {
    title: 'Statistik Perdagangan Malaysia Mengikut Negeri 2025 (Johor)',
    year: 2025,
    state: 'Johor',
    file: '/books/2025/statistik-perdagangan-malaysia-negeri-2025-johor.pdf',
    cover: '/covers/cover-2025-johor.png',
  },
    {
    title: 'Statistik Perdagangan Malaysia Mengikut Negeri 2025 (Kelantan)',
    year: 2025,
    state: 'Kelantan',
    file: '/books/2025/statistik-perdagangan-malaysia-negeri-2025-kelantan.pdf',
    cover: '/covers/cover-2025-kelantan.png',
  },
    {
    title: 'Statistik Perdagangan Malaysia Mengikut Negeri 2025 (Melaka)',
    year: 2025,
    state: 'Melaka',
    file: '/books/2025/statistik-perdagangan-malaysia-negeri-2025-melaka.pdf',
    cover: '/covers/cover-2025-melaka.png',
  },
    {
    title: 'Statistik Perdagangan Malaysia Mengikut Negeri 2025 (W.P. Kuala Lumpur)',
    year: 2025,
    state: 'W.P. Kuala Lumpur',
    file: '/books/2025/statistik-perdagangan-malaysia-negeri-2025-wp-kuala-lumpur.pdf',
    cover: '/covers/cover-2025-wp-kuala-lumpur.png',
  },
    {
    title: 'Statistik Perdagangan Malaysia Mengikut Negeri 2025 (W.P. Labuan)',
    year: 2025,
    state: 'W.P. Labuan',
    file: '/books/2025/statistik-perdagangan-malaysia-negeri-2025-wp-labuan.pdf',
    cover: '/covers/cover-2025-wp-labuan.png',
  },
];

export default function Publications() {
  const { lang } = useLanguage();
  const bookScrollRef = useRef<HTMLDivElement | null>(null);

  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [openStatsYear, setOpenStatsYear] = useState<number | null>(null);

  const years = [2025, 2024, 2023, 2022, 2021, 2020];

  const filteredBooks = useMemo(() => {
    if (selectedYear === 'all') return books;
    return books.filter((book) => String(book.year) === selectedYear);
  }, [selectedYear]);

  const scrollBooks = (direction: 'left' | 'right') => {
    if (!bookScrollRef.current) return;

    bookScrollRef.current.scrollBy({
      left: direction === 'left' ? -420 : 420,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    if (!bookScrollRef.current) return;

    const interval = window.setInterval(() => {
      const el = bookScrollRef.current;
      if (!el || selectedYear !== 'all') return;

      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll) return;

      el.scrollBy({
        left: 220,
        behavior: 'smooth',
      });
    }, 3500);

    return () => window.clearInterval(interval);
  }, [selectedYear]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {lang === 'bm' ? 'Penerbitan' : 'Publications'}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {lang === 'bm'
            ? 'Koleksi stats alert, buku penerbitan dan pautan rasmi berkaitan perdagangan Malaysia.'
            : 'Collection of stats alerts, publication books and official links related to Malaysia trade.'}
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card/70 p-4">
        <div className="flex items-start gap-3">
          <Newspaper className="mt-1 h-5 w-5 shrink-0 text-primary" />

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Stats Alert
            </p>

            <h2 className="mt-1 text-lg font-bold text-foreground">
              {lang === 'bm' ? 'Stats Alert Terkini' : 'Latest Stats Alert'}
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              {lang === 'bm'
                ? 'Paparan bergaya berita untuk stats alert terkini bagi tahun 2026.'
                : 'News-style display for the latest stats alerts in 2026.'}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {statsLatest.map((item) => (
            <article
              key={`${item.year}-${item.monthEn}`}
              className="overflow-hidden rounded-xl border border-border bg-background/40 transition hover:border-primary/50 hover:bg-background/70"
            >
              <div className="aspect-[16/10] bg-secondary/40">
                <img
                  src={lang === 'bm' ? item.coverBm : item.coverEn}
                  alt={lang === 'bm' ? item.titleBm : item.titleEn}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-4">
                <p className="text-[11px] font-medium text-muted-foreground">
                  {lang === 'bm' ? item.monthBm : item.monthEn} {item.year}
                </p>

                <h3 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-bold leading-snug text-foreground">
                  {lang === 'bm' ? item.titleBm : item.titleEn}
                </h3>

                <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">
                  {lang === 'bm'
                    ? 'Lihat stats alert perdagangan Malaysia mengikut bulan.'
                    : 'View Malaysia trade stats alert by month.'}
                </p>

                <div className="mt-4 flex justify-center">
                  <a
                    href={lang === 'bm' ? item.bmUrl : item.enUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                  >
                    {lang === 'bm' ? 'Lihat di sini' : 'View here'}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-bold text-foreground">
            {lang === 'bm' ? 'Stats Alert Mengikut Tahun' : 'Stats Alert by Year'}
          </h3>

          <div className="mt-3 space-y-2">
            {statsYears.map((item) => {
              const isOpen = openStatsYear === item.year;
              const monthlyItems =
                item.year === 2026 ? statsLatest : statsArchiveItems[item.year] || [];

              return (
                <div
                  key={item.year}
                  className="overflow-hidden rounded-xl border border-border bg-background/40"
                >
                  <button
                    type="button"
                    onClick={() => setOpenStatsYear(isOpen ? null : item.year)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-background/70"
                  >
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {lang === 'bm'
                          ? `Statistik Eksport Import Mengikut Negeri, ${item.year}`
                          : `Export Import Statistics by State, ${item.year}`}
                      </p>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {lang === 'bm' ? item.availabilityBm : item.availabilityEn}
                      </p>
                    </div>

                    <span className="text-sm font-bold text-primary">
                      {isOpen ? '▼' : '▸'}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="space-y-2 border-t border-border px-4 py-3">
                      {monthlyItems.length > 0 ? (
                        monthlyItems.map((m) => (
                          <div
                            key={lang === 'bm' ? m.titleBm : m.titleEn}
                            className="flex flex-col gap-2 rounded-lg bg-card/40 px-3 py-2 text-xs md:flex-row md:items-center md:justify-between"
                          >
                            <span className="font-medium text-foreground">
                              {lang === 'bm' ? m.titleBm : m.titleEn}
                            </span>

                            <a
                              href={lang === 'bm' ? m.bmUrl : m.enUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                            >
                              {lang === 'bm' ? 'Lihat' : 'View'}
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-lg bg-card/40 px-3 py-2 text-xs text-muted-foreground">
                          {lang === 'bm'
                            ? 'Senarai bulanan belum ditambah.'
                            : 'Monthly list has not been added yet.'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card/70 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              {lang === 'bm' ? 'Koleksi PDF' : 'PDF Collection'}
            </p>

            <h2 className="mt-1 text-lg font-bold text-foreground">
              {lang === 'bm' ? 'Buku Penerbitan' : 'Publication Books'}
            </h2>
          </div>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="h-9 w-[135px] rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground outline-none focus:border-primary"
          >
            <option value="all">{lang === 'bm' ? 'Semua Tahun' : 'All Years'}</option>

            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="relative mt-5">
          <button
            type="button"
            onClick={() => scrollBooks('left')}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border bg-background/90 p-2 text-foreground shadow-md backdrop-blur transition hover:bg-secondary"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div ref={bookScrollRef} className="overflow-x-auto scroll-smooth pb-2">
            <div className="flex gap-3">
              {filteredBooks.map((book) => (
                <article
                  key={book.file}
                  className="min-w-[165px] max-w-[165px] flex-shrink-0 overflow-hidden rounded-xl border border-border bg-background/40 transition hover:border-primary/50 hover:bg-background/70"
                >
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="aspect-[3/4] w-full object-cover"
                  />

                  <div className="p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {book.year}
                      </span>

                      {'state' in book && book.state ? (
                        <span className="truncate text-[10px] text-muted-foreground">
                          {book.state}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="line-clamp-3 min-h-[48px] text-xs font-bold leading-snug text-foreground">
                      {book.title}
                    </h3>

                    <a
                      href={book.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-center text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                    >
                      <span>{lang === 'bm' ? 'Lihat Buku' : 'View Book'}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => scrollBooks('right')}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border bg-background/90 p-2 text-foreground shadow-md backdrop-blur transition hover:bg-secondary"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card/70 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          {lang === 'bm' ? 'Ketahui Lebih Lanjut' : 'Learn More'}
        </p>

        <h2 className="mt-1 text-lg font-bold text-foreground">
          {lang === 'bm' ? 'Portal Rasmi DOSM' : 'Official DOSM Portal'}
        </h2>

        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          {lang === 'bm'
            ? 'Untuk maklumat rasmi, penerbitan penuh dan data terperinci, sila layari portal rasmi Jabatan Perangkaan Malaysia (DOSM).'
            : 'For official information, full publications and detailed data, please visit the official Department of Statistics Malaysia (DOSM) portal.'}
        </p>

        <a
          href="https://www.dosm.gov.my"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          {lang === 'bm' ? 'Layari Portal DOSM' : 'Visit DOSM Portal'}
          <ExternalLink className="h-4 w-4" />
        </a>
      </section>
    </div>
  );
}