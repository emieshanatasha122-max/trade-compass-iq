import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Publications() {
  const { t } = useLanguage();

  const cards = [
    {
      category: t('mediaStatement'),
      title: 'Statistik Eksport Import mengikut Negeri — Jan 2026',
      date: '01 Apr 2026',
      color: 'hsl(187, 92%, 55%)',
      url: 'https://www.dosm.gov.my',
    },
    {
      category: t('annualBook'),
      title: 'Buku Tahunan Perdagangan Luar Negeri Malaysia — 2025',
      date: '15 Mar 2026',
      color: 'hsl(42, 78%, 55%)',
      url: 'https://www.dosm.gov.my',
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-1">{t('articlesMedia')}</h2>
      <p className="text-xs text-muted-foreground mb-6">{t('publications')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card group cursor-pointer"
          >
            {/* Placeholder image area */}
            <div className="w-full h-32 rounded-lg mb-4 flex items-center justify-center" style={{ background: `${card.color}10` }}>
              <span className="text-3xl opacity-30">📄</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${card.color}20`, color: card.color }}>
                {card.category}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-3 leading-relaxed">{card.title}</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {card.date}
              </div>
              <a
                href={card.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-medium text-primary group-hover:underline"
              >
                {t('readMore')} <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
