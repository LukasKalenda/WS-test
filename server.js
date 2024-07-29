const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

app.get('/api/ares', async (req, res) => {
  const { ic } = req.query;
  if (!ic) {
    return res.status(400).json({ error: 'Chybí IČ' });
  }
  try {
    const response = await fetch(`https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ic}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching ARES data:', error);
    res.status(500).json({ error: 'Chyba při získávání dat z ARES' });
  }
});

app.get('/api/mapy', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Chybí dotaz' });
  }
  try {
    const url = `https://api.mapy.cz/v1/suggest?apiKey=9XaTSz3fWU_yHEXdZpBT9O0CjTUlfvn7fO8iGEVGaT8&query=${encodeURIComponent(query)}&type=street&limit=5&bounds=48.5370786,12.0921668|51.0746358,18.8927040`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching Mapy.cz data:', error);
    res.status(500).json({ error: 'Chyba při získávání dat z Mapy.cz' });
  }
});

app.listen(port, () => {
  console.log(`Server běží na portu ${port}`);
});