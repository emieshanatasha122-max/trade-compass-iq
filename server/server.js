import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/chat', (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: 'Tiada mesej diterima.' });
    }

    let reply = `Anda tanya: ${message}`;

    if (message.toLowerCase().includes('eksport')) {
      reply = 'Jumlah eksport semasa ialah 76.3B.';
    } else if (message.toLowerCase().includes('import')) {
      reply = 'Jumlah import semasa ialah 24.3B.';
    } else if (message.toLowerCase().includes('perdagangan')) {
      reply = 'Jumlah perdagangan semasa ialah 100.6B.';
    }

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: 'Ralat server berlaku.' });
  }
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});