export interface TradeRecord {
  jenisDagangan: 'Eksport' | 'Import';
  bulan: number;
  tahun: number;
  negeri: string;
  kawasan: string;
  keluasanSyarikat: 'Perusahaan Besar' | 'PKS' | 'Mikro';
  jumlahDaganganRM: number;
  komoditiUtama: string;
  destinasiEksport: string;
  negaraAsal: string;
}

const NEGERI = ['Selangor', 'Johor', 'Pulau Pinang', 'Sarawak', 'Sabah', 'Perak', 'Kedah', 'Pahang', 'Kelantan', 'Terengganu', 'Melaka', 'Negeri Sembilan', 'Perlis', 'W.P. Kuala Lumpur', 'W.P. Labuan'];
const KOMODITI = ['Elektrikal & Elektronik', 'Minyak Sawit', 'Petroleum', 'Jentera', 'Getah', 'Kimia', 'Kayu', 'Tekstil', 'Logam', 'Makanan'];
const DESTINASI = ['Singapura', 'China', 'Amerika Syarikat', 'Jepun', 'Thailand', 'Korea Selatan', 'India', 'Australia', 'Jerman', 'United Kingdom'];
const KAWASAN = ['Asia', 'Eropah', 'Amerika', 'Oceania', 'Afrika'];
const KELUASAN: TradeRecord['keluasanSyarikat'][] = ['Perusahaan Besar', 'PKS', 'Mikro'];

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
        
        data.push({
          jenisDagangan: isExport ? 'Eksport' : 'Import',
          bulan,
          tahun,
          negeri: NEGERI[negeriIdx],
          kawasan: KAWASAN[kawasanIdx],
          keluasanSyarikat: KELUASAN[keluasanIdx],
          jumlahDaganganRM: Math.round(baseValue * yearMultiplier * negeriMultiplier),
          komoditiUtama: KOMODITI[komoditiIdx],
          destinasiEksport: isExport ? DESTINASI[destIdx] : '',
          negaraAsal: isExport ? '' : DESTINASI[destIdx],
        });
      }
    }
  }
  return data;
}

export const tradeData = generateTradeData();
