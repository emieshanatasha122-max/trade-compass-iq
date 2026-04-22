// Translations for commodity names (BM source -> EN display)
// Falls back to sentence-case formatting when no translation exists.

const COMMODITY_EN_MAP: Record<string, string> = {
  'ALAT-ALAT ELEKTRONIK': 'Electronic Components',
  'ALAT-ALAT ELEKTRIK': 'Electrical Equipment',
  'KELUARAN PETROLEUM': 'Petroleum Products',
  'MINYAK MENTAH': 'Crude Petroleum',
  'GAS ASLI CECAIR': 'Liquefied Natural Gas',
  'MINYAK SAWIT': 'Palm Oil',
  'KELUARAN MINYAK SAWIT': 'Palm Oil Products',
  'KIMIA & KELUARAN KIMIA': 'Chemicals & Chemical Products',
  'BAHAN KIMIA': 'Chemicals',
  'KELUARAN KIMIA': 'Chemical Products',
  'MESIN, PERALATAN & ALAT GANTI': 'Machinery, Equipment & Parts',
  'KELUARAN BESI & KELULI': 'Iron & Steel Products',
  'BESI & KELULI': 'Iron & Steel',
  'KELUARAN LOGAM': 'Metal Products',
  'KELUARAN GETAH': 'Rubber Products',
  'GETAH ASLI': 'Natural Rubber',
  'KELUARAN KAYU': 'Wood Products',
  'KAYU BALAK': 'Logs',
  'PERABOT': 'Furniture',
  'TEKSTIL, PAKAIAN & KASUT': 'Textiles, Apparel & Footwear',
  'PAKAIAN': 'Apparel',
  'KASUT': 'Footwear',
  'KENDERAAN, ALAT GANTI & AKSESORI': 'Vehicles, Parts & Accessories',
  'KAPAL TERBANG, KAPAL & KENDERAAN PENGANGKUTAN LAIN': 'Aircraft, Ships & Other Transport',
  'OPTIK & PERALATAN SAINTIFIK': 'Optical & Scientific Equipment',
  'BARANG-BARANG MAKANAN': 'Food Products',
  'MINUMAN & TEMBAKAU': 'Beverages & Tobacco',
  'BAHAN MENTAH TIDAK BOLEH DIMAKAN': 'Crude Materials, Inedible',
  'BAHAN API MINERAL, PELINCIR': 'Mineral Fuels & Lubricants',
  'MINYAK & LEMAK HAIWAN/TUMBUHAN': 'Animal & Vegetable Oils',
  'BARANG DIKILANG': 'Manufactured Goods',
  'PELBAGAI BARANG DIKILANG': 'Miscellaneous Manufactured Articles',
  'JENTERA & KELENGKAPAN PENGANGKUTAN': 'Machinery & Transport Equipment',
  'LAIN-LAIN': 'Others',
  'OTHERS': 'Others',
};

function toSentenceCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(w => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

export function translateCommodity(name: string, lang: 'bm' | 'en'): string {
  const key = (name || '').trim().toUpperCase();
  if (lang === 'en' && COMMODITY_EN_MAP[key]) return COMMODITY_EN_MAP[key];
  return toSentenceCase(name);
}
