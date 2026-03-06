export interface TradeRecord {
  jenisDagangan: 'Eksport' | 'Import';
  bulan: number;
  tahun: number;
  negeri: string;
  kawasan: string;
  keluasanSyarikat: 'LARGE' | 'SME_MICRO' | 'SME_SMALL' | 'SME_MEDIUM' | 'AGENTS';
  jumlahDaganganRM: number;
  komoditiUtama: string;
  destinasiEksport: string;
  negaraAsal: string;
  kodDestinasiEksportImport: string;
  kodNegaraAsal: string;
}

const NEGERI = ['Selangor', 'Johor', 'Pulau Pinang', 'Sarawak', 'Sabah', 'Perak', 'Kedah', 'Pahang', 'Kelantan', 'Terengganu', 'Melaka', 'Negeri Sembilan', 'Perlis', 'W.P. Kuala Lumpur', 'W.P. Labuan', 'Supra'];
const KOMODITI = ['Elektrikal & Elektronik', 'Minyak Sawit', 'Petroleum', 'Jentera', 'Getah', 'Kimia', 'Kayu', 'Tekstil', 'Logam', 'Makanan'];
const DESTINASI = [
  { name: 'Singapura', code: 'SGP' },
  { name: 'China', code: 'CHN' },
  { name: 'Amerika Syarikat', code: 'USA' },
  { name: 'Jepun', code: 'JPN' },
  { name: 'Thailand', code: 'THA' },
  { name: 'Korea Selatan', code: 'KOR' },
  { name: 'India', code: 'IND' },
  { name: 'Australia', code: 'AUS' },
  { name: 'Jerman', code: 'DEU' },
  { name: 'United Kingdom', code: 'GBR' },
  { name: 'Other Countries, NES', code: 'OTH' },
];
const KAWASAN = ['Asia', 'Eropah', 'Amerika', 'Oceania', 'Afrika'];
const KELUASAN: TradeRecord['keluasanSyarikat'][] = ['LARGE', 'SME_MICRO', 'SME_SMALL', 'SME_MEDIUM', 'AGENTS'];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateTradeData(): TradeRecord[] {
  const data: TradeRecord[] = [];
  let seed = 42;
  
  for (let tahun = 2014; tahun <= 2024; tahun++) {
    for (let bulan = 1; bulan <= 12; bulan++) {
      const recordsPerMonth = Math.floor(seededRandom(seed++) * 5) + 6;
      for (let i = 0; i < recordsPerMonth; i++) {
        const negeriIdx = Math.floor(seededRandom(seed++) * NEGERI.length);
        const komoditiIdx = Math.floor(seededRandom(seed++) * KOMODITI.length);
        const destIdx = Math.floor(seededRandom(seed++) * DESTINASI.length);
        const kawasanIdx = Math.floor(seededRandom(seed++) * KAWASAN.length);
        const keluasanIdx = Math.floor(seededRandom(seed++) * KELUASAN.length);
        const isExport = seededRandom(seed++) > 0.45;
        
        const baseValue = (seededRandom(seed++) * 500 + 50) * 1000000;
        const yearMultiplier = 1 + (tahun - 2014) * 0.08;
        const negeriMultiplier = negeriIdx < 3 ? 2.5 : negeriIdx < 6 ? 1.5 : 0.8;
        
        const dest = DESTINASI[destIdx];
        data.push({
          jenisDagangan: isExport ? 'Eksport' : 'Import',
          bulan,
          tahun,
          negeri: NEGERI[negeriIdx],
          kawasan: KAWASAN[kawasanIdx],
          keluasanSyarikat: KELUASAN[keluasanIdx],
          jumlahDaganganRM: Math.round(baseValue * yearMultiplier * negeriMultiplier),
          komoditiUtama: KOMODITI[komoditiIdx],
          destinasiEksport: isExport ? dest.name : '',
          negaraAsal: isExport ? '' : dest.name,
          kodDestinasiEksportImport: isExport ? dest.code : '',
          kodNegaraAsal: isExport ? '' : dest.code,
        });
      }
    }
  }
  return data;
}

export const tradeData = generateTradeData();

// Country code mapping for world map (ISO 3166-1 alpha-3 used by react-simple-maps)
export const COUNTRY_CODE_MAP: Record<string, string> = {
  'SGP': 'SGP',
  'CHN': 'CHN',
  'USA': 'USA',
  'JPN': 'JPN',
  'THA': 'THA',
  'KOR': 'KOR',
  'IND': 'IND',
  'AUS': 'AUS',
  'DEU': 'DEU',
  'GBR': 'GBR',
};
