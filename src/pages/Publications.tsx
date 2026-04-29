import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Newspaper,
  Archive,
} from 'lucide-react';

const statsLatest = [
  {
    title: 'Stats Alert Januari 2026',
    month: 'Januari',
    monthEn: 'January',
    year: 2026,
    cover: '/stats-alert/covers/stats-alert-2026-jan.png',
    bmUrl: '#',
    enUrl: '#',
  },
  {
    title: 'Stats Alert Februari 2026',
    month: 'Februari',
    monthEn: 'February',
    year: 2026,
    cover: '/stats-alert/covers/stats-alert-2026-feb.png',
    bmUrl: '#',
    enUrl: '#',
  },
  {
    title: 'Stats Alert Mac 2026',
    month: 'Mac',
    monthEn: 'March',
    year: 2026,
    cover: '/stats-alert/covers/stats-alert-2026-mac.png',
    bmUrl: '#',
    enUrl: '#',
  },
];

const statsArchiveYears = [
  {
    year: 2025,
    count: 12,
    path: '/publications/stats-alert/2025',
  },
  {
    year: 2024,
    count: 12,
    path: '/publications/stats-alert/2024',
  },
  {
    year: 2023,
    count: 12,
    path: '/publications/stats-alert/2023',
  },
  {
    year: 2022,
    count: 1,
    path: '/publications/stats-alert/2022',
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
];

export default function Publications() {
  const { lang } = useLanguage();
  const bookScrollRef = useRef<HTMLDivElement | null>(null);
  const statsScrollRef = useRef<HTMLDivElement | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const years = [2025, 2024, 2023, 2022, 2021, 2020];

  const filteredBooks = useMemo(() => {
    if (selectedYear === 'all') return books;
    return books.filter((book) => String(book.year) === selectedYear);
  }, [selectedYear]);

  const scrollContainer = (
    ref: React.RefObject<HTMLDivElement>,
    direction: 'left' | 'right'
  ) => {
    if (!ref.current) return;

    ref.current.scrollBy({
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

      {/* Stats Alert Section */}
      <section className="rounded-xl border border-border bg-card/70 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Stats Alert
            </p>

            <h2 className="mt-1 text-lg font-bold text-foreground">
              {lang === 'bm' ? 'Stats Alert Terkini' : 'Latest Stats Alert'}
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              {lang === 'bm'
                ? 'Paparan terkini bagi tahun 2026. Pilih BM atau EN untuk melihat maklumat lanjut.'
                : 'Latest 2026 alerts. Select BM or EN to view more details.'}
            </p>
          </div>

          <Newspaper className="h-5 w-5 text-primary" />
        </div>

        <div className="relative mt-5">
          <button
            type="button"
            onClick={() => scrollContainer(statsScrollRef, 'left')}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border bg-background/90 p-2 text-foreground shadow-md backdrop-blur transition hover:bg-secondary"
            aria-label="Scroll stats alert left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div ref={statsScrollRef} className="overflow-x-auto scroll-smooth pb-2">
            <div className="flex gap-3">
              {statsLatest.map((item) => (
                <article
                  key={item.title}
                  className="min-w-[165px] max-w-[165px] flex-shrink-0 overflow-hidden rounded-xl border border-border bg-background/40 transition hover:border-primary/50 hover:bg-background/70"
                >
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="aspect-[3/4] w-full object-cover"
                  />

                  <div className="p-3">
                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {lang === 'bm' ? item.month : item.monthEn} {item.year}
                    </span>

                    <h3 className="mt-2 line-clamp-2 min-h-[34px] text-xs font-bold leading-snug text-foreground">
                      {item.title}
                    </h3>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <a
                        href={item.bmUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary px-2 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                      >
                        BM
                        <ExternalLink className="h-3 w-3" />
                      </a>

                      <a
                        href={item.enUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-border bg-background px-2 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary"
                      >
                        EN
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => scrollContainer(statsScrollRef, 'right')}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border bg-background/90 p-2 text-foreground shadow-md backdrop-blur transition hover:bg-secondary"
            aria-label="Scroll stats alert right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Archive Cards */}
        <div className="mt-6">
          <div className="flex items-center gap-2">
            <Archive className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              {lang === 'bm' ? 'Arkib Stats Alert' : 'Stats Alert Archive'}
            </h3>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {statsArchiveYears.map((item) => (
              <Link
                key={item.year}
                to={item.path}
                className="rounded-xl border border-border bg-background/40 p-4 transition hover:border-primary/50 hover:bg-background/70"
              >
                <p className="text-xl font-extrabold text-foreground">{item.year}</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {lang === 'bm'
                    ? `${item.count} stats alert tersedia`
                    : `${item.count} stats alerts available`}
                </p>

                <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  {lang === 'bm' ? 'Lihat Arkib' : 'View Archive'}
                  <ExternalLink className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Books Section */}
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
            <option value="all">
              {lang === 'bm' ? 'Semua Tahun' : 'All Years'}
            </option>

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
            onClick={() => scrollContainer(bookScrollRef, 'left')}
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
            onClick={() => scrollContainer(bookScrollRef, 'right')}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border bg-background/90 p-2 text-foreground shadow-md backdrop-blur transition hover:bg-secondary"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* DOSM Section */}
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