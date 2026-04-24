import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sun, Moon, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import ChatBot from '@/components/ChatBot';
import SidebarFilters from '@/components/SidebarFilters';

export default function DashboardLayout() {
  const { lang, setLang, t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isHomePage = location.pathname === '/' || location.pathname === '';
  const isPublicationsPage = location.pathname === '/publications';

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full shrink-0 overflow-hidden border-r border-sidebar-border bg-sidebar"
          >
            <SidebarFilters />
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="relative h-16 shrink-0 overflow-hidden border-b border-border bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/75">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-10 top-0 h-24 w-48 bg-cyan-400/10 blur-3xl dark:bg-cyan-500/10" />
            <div className="absolute left-1/3 top-0 h-24 w-56 bg-blue-400/10 blur-3xl dark:bg-blue-500/10" />
            <div className="absolute right-0 top-0 h-24 w-48 bg-violet-400/10 blur-3xl dark:bg-violet-500/10" />
          </div>

          <div className="relative z-10 h-full px-4">
            <div className="grid h-full grid-cols-[1fr_auto_1fr] items-center gap-4">
              {/* LEFT */}
              <div className="flex min-w-0 items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="shrink-0 rounded-xl p-2 text-foreground hover:bg-secondary"
                  aria-label="Toggle sidebar"
                >
                  {sidebarOpen ? (
                    <PanelLeftClose className="h-4 w-4" />
                  ) : (
                    <PanelLeft className="h-4 w-4" />
                  )}
                </button>

                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex items-center gap-2">
                    <img
                      src="/jata-negara.png"
                      alt="Jata Negara"
                      className="h-12 w-12 object-contain"
                    />
                    <img
                      src="/nbdac-logo.png"
                      alt="NBDAC"
                      className="h-12 w-12 object-contain"
                    />
                  </div>

                  <div className="min-w-0 leading-tight">
                    <h1 className="truncate bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-sm font-extrabold uppercase tracking-wide text-transparent md:text-base">
                      {t('dashboardTitle')}
                    </h1>

                    <p className="truncate text-[10px] md:text-xs text-muted-foreground/80">
                      {lang === 'bm'
                        ? 'Pusat Analitik Data Raya Negara'
                        : 'National Big Data Analytic Centre'}
                    </p>
                  </div>
                </div>
              </div>

              {/* CENTER NAV */}
              <nav className="hidden md:flex items-center justify-center gap-3">
                <a
                  href="/#overview-top"
                  className={`rounded-full border border-border px-4 py-1.5 text-xs font-semibold ${
                    isHomePage
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  Overview
                </a>

                <a
                  href="/#dashboard-sections"
                  className="rounded-full border border-border bg-background/60 px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  Dashboard
                </a>

                <Link
                  to="/publications"
                  className={`rounded-full border border-border px-4 py-1.5 text-xs font-semibold ${
                    isPublicationsPage
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  {lang === 'bm' ? 'Penerbitan' : 'Publications'}
                </Link>
              </nav>

              {/* RIGHT */}
              <div className="flex items-center justify-end gap-5">
                <div className="hidden md:flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5 opacity-70"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z"
                    />
                  </svg>

                  <span>
                    {new Date().toLocaleDateString(lang === 'bm' ? 'ms-MY' : 'en-GB', {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex overflow-hidden rounded-xl border border-border text-xs">
                  <button
                    onClick={() => setLang('bm')}
                    className={`px-3 py-1.5 text-xs ${
                      lang === 'bm'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    BM
                  </button>
                  <button
                    onClick={() => setLang('en')}
                    className={`px-3 py-1.5 text-xs ${
                      lang === 'en'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    EN
                  </button>
                </div>

                <button
                  onClick={toggleTheme}
                  className="rounded-xl p-2 text-muted-foreground hover:bg-secondary"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      <ChatBot />
    </div>
  );
}