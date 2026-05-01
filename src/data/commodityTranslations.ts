// ===============================
// Proper Case Function (BM)
// ===============================
function toProperCase(str: string): string {
  if (!str) return '';

  return str
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word =>
      word
        .split('-')
        .map(part =>
          part.length > 0
            ? part.charAt(0).toUpperCase() + part.slice(1)
            : part
        )
        .join('-')
    )
    .join(' ');
}

// ===============================
// FULL BM → EN MAP
// ===============================
const COMMODITY_EN_MAP: Record<string, string> = {
  'ALAT GANTI & AKSESORI BAGI MESIN PEJABAT & KELENGKAPAN PEMPROSESAN DATA AUTOMATIK':
    'Spare Parts & Accessories for Office Machines & Automatic Data Processing Equipment',

  'ALAT GANTI DAN AKSESORI BAGI MESIN PEJABAT & KELENGKAPAN PEMPROSESAN DATA AUTOMATIK':
    'Spare Parts and Accessories for Office Machines & Automatic Data Processing Equipment',

  'ALAT-ALAT ELEKTRONIK':
    'Electronic Equipment',

  'BAHAN MAKANAN UNTUK BINATANG (TIDAK TERMASUK BIJIAN BELUM DIKILANG)':
    'Animal Feed (Excluding Unprocessed Grains)',

  'BARANGAN ELEKTRIK DAN ELEKTRONIK YANG LAIN':
    'Other Electrical and Electronic Goods',

  'BERAS':
    'Rice',

  'BESI BRIKUET PANAS':
    'Hot Briquetted Iron',

  'BIJI KOKO':
    'Cocoa Beans',

  'BIJIH TIMAH DAN KONSENTRAT':
    'Tin Ores and Concentrates',

  'DEDAK ISIRUNG KELAPA SAWIT':
    'Palm Kernel Cake',

  'ENJIN OMBOH PEMBAKARAN DALAMAN DAN ALAT GANTI':
    'Internal Combustion Piston Engines and Parts',

  'GANDUM BELUM DIKILANG':
    'Unmilled Wheat',

  'GAS ASLI CECAIR- LNG':
    'Liquefied Natural Gas (LNG)',

  'GETAH ASLI':
    'Natural Rubber',

  'GULA DARIPADA BIT ATAU TEBU':
    'Sugar from Beet or Cane',

  'HASIL KELUARAN KELAPA SAWIT YANG LAIN':
    'Other Palm Oil Products',

  'ISIRUNG KELAPA SAWIT':
    'Palm Kernel',

  'JAGUNG (TERMASUK JAGUNG MANIS)':
    'Corn (Including Sweet Corn)',

  'JENTERA & KELENGKAPAN KHUSUS UNTUK INDUSTRI TERTENTU & ALAT GANTI':
    'Specialized Machinery & Equipment for Specific Industries & Parts',

  'KACANG SOYA':
    'Soybeans',

  'KAIN KAPAS DLL':
    'Cotton Fabrics etc.',

  'KAIN KAPAS TENUN':
    'Woven Cotton Fabrics',

  'KAIN TENUNAN DARIPADA GENTIAN BUATAN MANUSIA':
    'Woven Fabrics of Man-Made Fibres',

  'KASUT':
    'Footwear',

  'KAYU BALAK':
    'Logs (Timber)',

  'KAYU GERGAJI':
    'Sawn Timber',

  'KAYU KUMAI':
    'Mouldings (Timber)',

  'KAYU TANGGAM':
    'Joinery Wood',

  'KELENGKAPAN PEMANASAN & PENDINGINAN & ALAT GANTI':
    'Heating & Coolinging Equipment & Parts',

  'KELENGKAPAN PENAPIS/PEMBERSIH CECAIR DAN GAS':
    'Liquid and Gas Filtering/Purifying Equipment',

  'KELENGKAPAN PENDINGINAN DAN PEMANASAN & ALAT GANTI':
    'Cooling and Heating Equipment & Parts',

  'KELUARAN BESI GELEK RATA ATAU KELULI':
    'Flat-Rolled Iron or Steel Products',

  'KELUARAN PETROLEUM  BERTAPIS':
    'Refined Petroleum Products',

  'KELUARAN PETROLEUM BERTAPIS':
    'Refined Petroleum Products',

  'KERTAS AKHBAR':
    'Newsprint Paper',

  'KRISTAL PIEZO ELEKTRIK & ALAT GANTI':
    'Piezo-electric Crystals & Parts',

  'LADA (HITAM DAN PUTIH)':
    'Pepper (Black and White)',

  'LAIN-LAIN':
    'Others',

  'LAIN-LAIN KAYU - PULP':
    'Other Wood - Pulp',

  'LAIN-LAIN KAYU - RATTAN WHOLE & SPLITS':
    'Other Wood - Rattan Whole & Splits',

  'LAIN-LAIN KAYU - SLEEPERS':
    'Other Wood - Sleepers',

  'LAIN-LAIN KAYU -CHIPBOARD / PARTICLEBOARD':
    'Other Wood - Chipboard / Particleboard',

  'LAIN-LAIN KAYU -GAHARU WOODCHIPS':
    'Other Wood - Agarwood Woodchips',

  'LAIN-LAIN KAYU -OTHER ARTICLES OF WOOD':
    'Other Wood - Other Articles of Wood',

  'LAIN-LAIN KAYU -SANDAL WOODCHIPS':
    'Other Wood - Sandalwood Woodchips',

  'LAIN-LAIN KAYU- LAIN-LAIN':
    'Other Wood - Others',

  'METANOL':
    'Methanol',

  'MINYAK ISIRUNG KELAPA SAWIT':
    'Palm Kernel Oil',

  'MINYAK KELAPA SAWIT':
    'Palm Oil',

  'OLEOKIMIA BERASASKAN KELAPA SAWIT':
    'Palm-Based Oleochemicals',

  'PAKAIAN DAN SEGALA KELENGKAPAN PAKAIAN TERPILIH':
    'Selected Apparel and Clothing Accessories',

  'PAPAN GENTIAN':
    'Fibreboard',

  'PAPAN LAPIS':
    'Plywood',

  'PEMAMPAT UDARA DAN GAS':
    'Air and Gas Compressors',

  'PERABUT KAYU DAN ROTAN':
    'Wooden and Rattan Furniture',

  'PERKAKAS LITAR ELEKTRIK & ALAT GANTI':
    'Electrical Circuit Equipment & Parts',

  'PERKAKAS MESIN YANG DIGUNAKAN UNTUK MEMBUANG LOGAM ATAU BAHAN LAIN':
    'Machine Tools for Removing Metal or Other Materials',

  'PESAWAT UDARA & KELENGKAPAN  & ALAT GANTI':
    'Aircraft & Equipment & Parts',

  'PESAWAT UDARA & KELENGKAPAN DAN ALAT GANTI':
    'Aircraft & Equipment and Parts',

  'PETROLEUM MENTAH':
    'Crude Petroleum',

  'SARUNG TANGAN GETAH':
    'Rubber Gloves',

  'SAYUR-SAYURAN':
    'Vegetables',

  'SIMEN':
    'Cement',

  'STRUKTUR BESI ATAU KELULI':
    'Iron or Steel Structures',

  'TEMBAGA (TERMASUK ALOI)':
    'Copper (Including Alloys)',

  'TEMBAKAU YANG BELUM DIKILANGKAN':
    'Unmanufactured Tobacco',

  'VENIR KEPING':
    'Veneer Sheets',

  'KELENGKAPAN TELEKOMUNIMASI, ALAT GANTI DAN AKSESORI':
    'Telecommunications Equipment, Parts and Accessories',

  'ALAT DAN PERKAMAS IKHTISAS, SAINS DAN KAWALAN, T.S.T.L.':
    'Professional, Scientific and Control Instruments, N.E.S.',

  'BARANG KEMAS DRPD. PERAK DAN PERMATA TERMASUK TIRUAN':
    'Jewellery of Silver and Precious Stones Including Imitation',

  'ALAT & PERKAKAS MENGUKUR, MEMERIKSA MENGANALISIS DAN KAWALAN':
    'Measuring, Checking, Analysing and Control Instruments',

  'ALAT GANTI & AKSESORI BAGI TRAKTOR,KERETA, KENDERAAN BARANG/JALAN RAYA BERMOTOR':
    'Parts and Accessories for Tractors, Cars, Goods Vehicles/Road Motor Vehicles',

  'BATANG PIPIH, BATANG BULAT, DSB DARIPADA BESI DAN KELULI':
    'Flat Bars, Round Bars, etc. of Iron and Steel',

  'PERKILANGAN LOGAM, TSTL':
    'Manufactures of Metal, N.E.S.',

  'BARANG-BARANG PLASTIK, TSTL':
    'Plastic Products, N.E.S.',

  'MOTOKAR, SUDAH DIPASANG, BARU':
    'Motor Cars, Assembled, New',

  'SALURAN, PAIP DAN PASANGAN BESI ATAU KELULI':
    'Tubes, Pipes and Fittings of Iron or Steel',

  'TIMAH, BUKAN ALOI':
    'Tin, Not Alloyed',

  'EMAS, BUKAN BENTUK WANG':
    'Gold, Non-Monetary',

  'BAJA, DIKILANGKAN':
    'Manufactured Fertilizers',

  'KAPAL, BOT DAN STRUKTUR TERAPUNG':
    'Ships, Boats and Floating Structures',

  'SUSU, DAN KRIM, TEPUNG':
    'Milk and Cream, Powdered',

  'LOJI, ELEKTRIK DAN ALAT GANTI, TSTL':
    'Electrical Machinery and Parts, N.E.S.',

  'MENTEGA, LEMAK DAN MINYAK KOKO':
    'Butter, Fats and Cocoa Oil',
};

// ===============================
// MAIN FUNCTION
// ===============================
export function translateCommodity(
  name: string,
  lang: 'bm' | 'en'
): string {
  const key = (name || '').trim().toUpperCase();

  if (lang === 'en') {
    return COMMODITY_EN_MAP[key] || toProperCase(name);
  }

  return toProperCase(name);
}