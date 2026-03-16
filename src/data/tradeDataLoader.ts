import Papa from 'papaparse';

export interface TradeRecord {
  jenisDagangan: 'Eksport' | 'Import';
  bulan: number;
  tahun: number;
  negeri: string;
  kawasan: string;
  keluasanSyarikat: string;
  jumlahDaganganRM: number;
  komoditiUtama: string;
  destinasiEksport: string;
  negaraAsal: string;
  kodDestinasiEksportImport: string;
  kodNegaraAsal: string;
  kawasanEkonomi: string;
}

const NEGERI_MAP: Record<string, string> = {
  'JOHOR': 'Johor',
  'SELANGOR': 'Selangor',
  'PULAU PINANG': 'Pulau Pinang',
  'SARAWAK': 'Sarawak',
  'SABAH': 'Sabah',
  'PERAK': 'Perak',
  'KEDAH': 'Kedah',
  'PAHANG': 'Pahang',
  'KELANTAN': 'Kelantan',
  'TERENGGANU': 'Terengganu',
  'MELAKA': 'Melaka',
  'NEGERI SEMBILAN': 'Negeri Sembilan',
  'PERLIS': 'Perlis',
  'WP KUALA LUMPUR': 'W.P. Kuala Lumpur',
  'WP LABUAN': 'W.P. Labuan',
  // Merge W.P. Putrajaya into W.P. Kuala Lumpur
  'WP PUTRAJAYA': 'W.P. Kuala Lumpur',
  'SUPRA': 'Supra',
};

// Excluded negeri/enterprise values
const EXCLUDED_NEGERI = new Set(['Supra', 'Agent']);
const EXCLUDED_ENTERPRISE = new Set(['AGENTS']);

export const ALPHA2_TO_ALPHA3: Record<string, string> = {
  SG: 'SGP', CN: 'CHN', US: 'USA', JP: 'JPN', TH: 'THA',
  KR: 'KOR', IN: 'IND', AU: 'AUS', DE: 'DEU', GB: 'GBR',
  TW: 'TWN', HK: 'HKG', PH: 'PHL', VN: 'VNM', ID: 'IDN',
  MY: 'MYS', FR: 'FRA', IT: 'ITA', NL: 'NLD', ES: 'ESP',
  BE: 'BEL', CH: 'CHE', CA: 'CAN', MX: 'MEX', BR: 'BRA',
  AE: 'ARE', SA: 'SAU', EG: 'EGY', ZA: 'ZAF', NG: 'NGA',
  BD: 'BGD', PK: 'PAK', LK: 'LKA', MM: 'MMR', KH: 'KHM',
  LA: 'LAO', BN: 'BRN', NZ: 'NZL', TR: 'TUR', RU: 'RUS',
  PL: 'POL', SE: 'SWE', NO: 'NOR', DK: 'DNK', FI: 'FIN',
  PT: 'PRT', AT: 'AUT', IE: 'IRL', CZ: 'CZE', HU: 'HUN',
  RO: 'ROU', GR: 'GRC', IL: 'ISR', JO: 'JOR', KW: 'KWT',
  QA: 'QAT', BH: 'BHR', OM: 'OMN', IQ: 'IRQ', IR: 'IRN',
  CL: 'CHL', AR: 'ARG', CO: 'COL', PE: 'PER', EC: 'ECU',
  UY: 'URY', VE: 'VEN', SC: 'SYC', KE: 'KEN', GH: 'GHA',
  TZ: 'TZA', ET: 'ETH', MZ: 'MOZ', SN: 'SEN', CM: 'CMR',
};

function normalizeNegeri(raw: string): string {
  const upper = raw.trim().toUpperCase();
  return NEGERI_MAP[upper] || raw.trim();
}

function normalizeJenisDagangan(raw: string): 'Eksport' | 'Import' {
  const upper = raw.trim().toUpperCase();
  return upper === 'EKSPORT' ? 'Eksport' : 'Import';
}

interface CSVRow {
  JENIS_DAGANGAN: string;
  BULAN: string;
  TAHUN: string;
  NEGERI: string;
  KAWASAN: string;
  SAIZ_SYARIKAT: string;
  KOD_DESTINASI_EKSPORT: string;
  KOD_NEGARA_ASAL: string;
  KAWASAN_EKONOMI: string;
  JUMLAH_DAGANGAN_RM: string;
  BARANGAN_UTAMA: string;
  DESTINASI_EKSPORT: string;
  NEGARA_ASAL: string;
}

let cachedData: TradeRecord[] | null = null;
let loadingPromise: Promise<TradeRecord[]> | null = null;

export async function loadTradeData(): Promise<TradeRecord[]> {
  if (cachedData) return cachedData;
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise<TradeRecord[]>((resolve, reject) => {
    Papa.parse<CSVRow>('/data/trade_data.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        const records: TradeRecord[] = [];
        for (const row of results.data) {
          if (!row.TAHUN || !row.BULAN) continue;
          const val = parseFloat(row.JUMLAH_DAGANGAN_RM);
          if (isNaN(val)) continue;

          const jenis = normalizeJenisDagangan(row.JENIS_DAGANGAN);
          const kodDest = (row.KOD_DESTINASI_EKSPORT || '').trim();
          const kodAsal = (row.KOD_NEGARA_ASAL || '').trim();
          const negeri = normalizeNegeri(row.NEGERI);
          const enterprise = (row.SAIZ_SYARIKAT || '').trim();

          // Exclude Agent/Supra data
          if (EXCLUDED_NEGERI.has(negeri)) continue;
          if (EXCLUDED_ENTERPRISE.has(enterprise)) continue;

          records.push({
            jenisDagangan: jenis,
            bulan: parseInt(row.BULAN, 10),
            tahun: parseInt(row.TAHUN, 10),
            negeri,
            kawasan: (row.KAWASAN || '').trim(),
            keluasanSyarikat: enterprise,
            jumlahDaganganRM: val,
            komoditiUtama: (row.BARANGAN_UTAMA || '').trim(),
            destinasiEksport: (row.DESTINASI_EKSPORT || '').trim(),
            negaraAsal: (row.NEGARA_ASAL || '').trim(),
            kodDestinasiEksportImport: jenis === 'Eksport' ? kodDest : kodAsal,
            kodNegaraAsal: kodAsal,
            kawasanEkonomi: (row.KAWASAN_EKONOMI || '').trim(),
          });
        }
        cachedData = records;
        resolve(records);
      },
      error: (err: Error) => reject(err),
    });
  });

  return loadingPromise;
}

export const COUNTRY_CODE_MAP: Record<string, string> = {
  'SGP': 'SGP', 'CHN': 'CHN', 'USA': 'USA', 'JPN': 'JPN',
  'THA': 'THA', 'KOR': 'KOR', 'IND': 'IND', 'AUS': 'AUS',
  'DEU': 'DEU', 'GBR': 'GBR', 'TWN': 'TWN', 'HKG': 'HKG',
  'PHL': 'PHL', 'VNM': 'VNM', 'IDN': 'IDN', 'FRA': 'FRA',
  'ITA': 'ITA', 'NLD': 'NLD', 'BEL': 'BEL', 'ARE': 'ARE',
  'SAU': 'SAU', 'BRA': 'BRA', 'CAN': 'CAN', 'MEX': 'MEX',
};
