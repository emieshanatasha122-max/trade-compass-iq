import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { BarChart3, Menu, X, Sun, Moon, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import ChatBot from '@/components/ChatBot';
import SidebarFilters from '@/components/SidebarFilters';

export default function DashboardLayout() {
  const { lang, setLang, t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Filter Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full flex flex-col border-r border-sidebar-border overflow-hidden bg-sidebar shrink-0"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-sidebar-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-sidebar-primary-foreground" />
                </div>
                <div className="text-xs font-bold leading-tight text-sidebar-accent-foreground">
                  DOSM<br />
                  <span className="text-[10px] font-normal text-sidebar-foreground">TEC Data Hub</span>
                </div>
              </div>
            </div>

            {/* Filter Content */}
            <SidebarFilters />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0 bg-card">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-foreground">
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </button>
            <div>
              <h1 className="text-sm font-bold tracking-wide gradient-text uppercase">
                {t('dashboardTitle')}
              </h1>
              <p className="text-[9px] text-muted-foreground -mt-0.5">{t('dashboardSubtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg overflow-hidden border border-border text-xs">
              <button
                onClick={() => setLang('bm')}
                className={`px-2.5 py-1 transition-colors ${lang === 'bm' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                BM
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 transition-colors ${lang === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                EN
              </button>
            </div>

            <button onClick={toggleTheme} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
          <Outlet />
        </main>
      </div>

      <ChatBot />
    </div>
  );
}
