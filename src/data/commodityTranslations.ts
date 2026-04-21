// BM (source) → EN translations for the most common commodity labels.
// Falls back to the original BM name (sentence-cased) when no entry exists.

export const COMMODITY_EN_MAP: Record<string, string> = {
  'BARANGAN ELEKTRIK DAN ELEKTRONIK YANG LAIN': 'Other Electrical & Electronic Goods',
  'PERKAKAS LITAR ELEKTRIK & ALAT GANTI': 'Electrical Circuit Apparatus & Parts',
  'ALAT DAN PERKAKAS IKHTISAS': 'Professional Instruments & Apparatus',
  'KELENGKAPAN TELEKOMUNIKASI': 'Telecommunications Equipment',
  'ALAT & PERKAKAS MENGUKUR': 'Measuring Instruments & Apparatus',
  'PAKAIAN DAN SEGALA KELENGKAPAN PAKAIAN TERPILIH': 'Apparel & Clothing Accessories',
  'ALAT-ALAT ELEKTRONIK': 'Electronic Components',
  'PERABUT KAYU DAN ROTAN': 'Wooden & Rattan Furniture',
  'OLEOKIMIA BERASASKAN KELAPA SAWIT': 'Palm-Oil-Based Oleochemicals',
  'PERKILANGAN LOGAM': 'Metal Manufactures',
  'LAIN-LAIN': 'Others',
  'BARANG-BARANG PLASTIK': 'Plastic Goods',
  'JENTERA & KELENGKAPAN KHUSUS UNTUK INDUSTRI TERTENTU & ALAT GANTI':
    'Specialised Industrial Machinery & Parts',
  'SARUNG TANGAN GETAH': 'Rubber Gloves',
  'KRISTAL PIEZO ELEKTRIK & ALAT GANTI': 'Piezoelectric Crystals & Parts',
  'ALAT GANTI & AKSESORI BAGI TRAKTOR': 'Tractor Parts & Accessories',
  'ALAT GANTI DAN AKSESORI BAGI MESIN PEJABAT & KELENGKAPAN PEMPROSESAN DATA AUTOMATIK':
    'Office Machine & Data Processing Equipment Parts',
  'ALAT GANTI & AKSESORI BAGI MESIN PEJABAT & KELENGKAPAN PEMPROSESAN DATA AUTOMATIK':
    'Office Machine & Data Processing Equipment Parts',
  'KELENGKAPAN PENDINGINAN DAN PEMANASAN & ALAT GANTI': 'Heating & Cooling Equipment & Parts',
  'KELENGKAPAN PEMANASAN & PENDINGINAN & ALAT GANTI': 'Heating & Cooling Equipment & Parts',
  'SAYUR-SAYURAN': 'Vegetables',
  'LOJI ELEKTRIK DAN ALAT GANTI': 'Electrical Plant & Parts',
  'KAYU GERGAJI': 'Sawn Wood',
  'KELENGKAPAN PENAPIS/PEMBERSIH CECAIR DAN GAS': 'Liquid & Gas Filtering Equipment',
  'KASUT': 'Footwear',
  'HASIL KELUARAN KELAPA SAWIT YANG LAIN': 'Other Palm Oil Products',
  'KELUARAN PETROLEUM BERTAPIS': 'Refined Petroleum Products',
  'KELUARAN PETROLEUM  BERTAPIS': 'Refined Petroleum Products',
  'MINYAK KELAPA SAWIT': 'Palm Oil',
  'SALURAN': 'Pipes & Tubes',
  'BAJA': 'Fertilisers',
  'BARANG KEMAS DRPD. EMAS': 'Gold Jewellery',
  'BATANG PIPIH': 'Flat Bars',
  'EMAS': 'Gold',
  'HIDROKARBON': 'Hydrocarbons',
  'IKAN': 'Fish',
  'JENTERA-JENTERA PENGGALI': 'Excavating Machinery',
  'KAIN': 'Fabric',
  'KAPAL': 'Ships',
  'KAPAS': 'Cotton',
  'KAPUR': 'Lime',
  'KERTAS CETAK DAN KERTAS TULIS': 'Printing & Writing Paper',
  'KERTAS KRAFT DAN PAPAN KERTAS': 'Kraft Paper & Paperboard',
  'KRUSTASEA & MOLUSKA': 'Crustaceans & Molluscs',
  'MENTEGA': 'Butter',
  'MESIN DERIK': 'Cranes',
  'MOTOKAR': 'Motor Cars',
  'MOTORBAS  &  LORI': 'Motor Buses & Lorries',
  'MOTORBAS & LORI': 'Motor Buses & Lorries',
  'PACUAN EMPAT RODA': 'Four-Wheel Drive Vehicles',
  'PERKILANGAN GALIAN': 'Mineral Manufactures',
  'SUSU DAN KRIM': 'Milk & Cream',
  'SUSU TEPUNG TERSEDIA': 'Powdered Milk',
  'TIMAH': 'Tin',
  'UDANG': 'Prawns',
  'VAN': 'Vans',
  'BRANDY': 'Brandy',
};

function toSentenceCase(str: string): string {
  if (!str) return str;
  const lower = str.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function translateCommodity(name: string, lang: 'bm' | 'en'): string {
  const key = (name || '').trim().toUpperCase();
  if (lang === 'en') {
    const en = COMMODITY_EN_MAP[key];
    if (en) return en;
    // Fallback: sentence-case the original BM name
    return toSentenceCase(name);
  }
  return toSentenceCase(name);
}
