import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Publications() {
  const { lang } = useLanguage();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {lang === 'bm' ? 'Penerbitan' : 'Publications'}
        </h1>

        <p className="text-sm text-muted-foreground">
          {lang === 'bm'
            ? 'Koleksi penerbitan rasmi, buku tahunan dan kenyataan media perdagangan Malaysia.'
            : 'Collection of official publications, annual reports and trade-related media releases.'}
        </p>
      </div>

      {/* Main Card */}
      <div className="border border-border rounded-xl p-6 bg-card space-y-4">
        
        <p className="text-sm text-muted-foreground">
          {lang === 'bm'
            ? 'Halaman ini sedang dibangunkan. Kandungan akan merangkumi:'
            : 'This page is under development. It will include:'}
        </p>

        <ul className="list-disc ml-5 text-sm text-muted-foreground space-y-1">
          <li>
            {lang === 'bm'
              ? 'Berita dan kenyataan media bulanan'
              : 'Monthly news and media releases'}
          </li>
          <li>
            {lang === 'bm'
              ? 'Buku laporan tahunan negeri (PDF)'
              : 'State annual reports (PDF)'}
          </li>
          <li>
            {lang === 'bm'
              ? 'Pautan ke data terperinci'
              : 'Links to detailed datasets'}
          </li>
        </ul>
      </div>

    </div>
  );
}