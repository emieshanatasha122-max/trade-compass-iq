import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/api/dashboard-summary', (req, res) => {
  res.json({
    message: 'Dashboard summary API is running',
  });
});

app.post('/api/dashboard-summary', (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data)) {
      return res.status(400).json({
        error: 'Data dashboard tidak diterima.',
      });
    }

    const totalTrade = data.reduce((sum, r) => sum + (r.jumlahDaganganRM || 0), 0);

    const totalExport = data
      .filter(r => r.jenisDagangan === 'Eksport')
      .reduce((sum, r) => sum + (r.jumlahDaganganRM || 0), 0);

    const totalImport = data
      .filter(r => r.jenisDagangan === 'Import')
      .reduce((sum, r) => sum + (r.jumlahDaganganRM || 0), 0);

    const tradeBalance = totalExport - totalImport;

    const groupSum = (key, filterFn = () => true) => {
      const map = {};

      data.filter(filterFn).forEach(r => {
        const name = r[key] || 'Tidak Diketahui';
        map[name] = (map[name] || 0) + (r.jumlahDaganganRM || 0);
      });

      return Object.entries(map)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    };

    const yearlyTrendMap = {};

    data.forEach(r => {
      const year = r.tahun;
      if (!year) return;

      if (!yearlyTrendMap[year]) {
        yearlyTrendMap[year] = {
          year,
          export: 0,
          import: 0,
          total: 0,
        };
      }

      if (r.jenisDagangan === 'Eksport') {
        yearlyTrendMap[year].export += r.jumlahDaganganRM || 0;
      } else if (r.jenisDagangan === 'Import') {
        yearlyTrendMap[year].import += r.jumlahDaganganRM || 0;
      }

      yearlyTrendMap[year].total += r.jumlahDaganganRM || 0;
    });

    const countryMap = {};

    data.forEach(r => {
      const code = r.kodDestinasiEksportImport;
      if (!code || code === 'MY') return;

      if (!countryMap[code]) {
        countryMap[code] = {
          code,
          name: r.destinasiEksport || r.negaraAsal || code,
          export: 0,
          import: 0,
          total: 0,
        };
      }

      if (r.jenisDagangan === 'Eksport') {
        countryMap[code].export += r.jumlahDaganganRM || 0;
      } else if (r.jenisDagangan === 'Import') {
        countryMap[code].import += r.jumlahDaganganRM || 0;
      }

      countryMap[code].total += r.jumlahDaganganRM || 0;
    });

    res.json({
      summary: {
        totalTrade,
        totalExport,
        totalImport,
        tradeBalance,
      },
      topExportCommodities: groupSum(
        'komoditiUtama',
        r => r.jenisDagangan === 'Eksport'
      ).slice(0, 10),
      topImportCommodities: groupSum(
        'komoditiUtama',
        r => r.jenisDagangan === 'Import'
      ).slice(0, 10),
      topTradingStates: groupSum('negeri').slice(0, 10),
      yearlyTrend: Object.values(yearlyTrendMap).sort((a, b) => a.year - b.year),
      topCountries: Object.values(countryMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Ralat semasa menjana dashboard summary.',
    });
  }
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});