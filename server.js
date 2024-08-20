const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const NINJA_API_KEY = process.env.NINJA_API_KEY;
const ECOMAIL_API_KEY = process.env.ECOMAIL_API_KEY;
const NINJA_API_URL = process.env.NINJA_API_URL;
const ECOMAIL_API_URL = process.env.ECOMAIL_API_URL;
const MAPY_CZ_API_KEY = process.env.MAPY_CZ_API_KEY;

app.get('/api/ares', async (req, res) => {
  const { ic } = req.query;
  if (!ic) {
    return res.status(400).json({ error: 'Chybí IČ' });
  }
  try {
    const response = await fetch(`https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ic}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    const firmData = {
      obchodniJmeno: data.obchodniJmeno,
      sidlo: {
        ulice: data.sidlo?.ulice,
        cisloDomovni: data.sidlo?.cisloDomovni,
        cisloOrientacni: data.sidlo?.cisloOrientacni,
        obec: data.sidlo?.obec,
        psc: data.sidlo?.psc
      },
      dic: data.dic
    };
    
    res.json(firmData);
  } catch (error) {
    console.error('Error fetching ARES data:', error);
    res.status(500).json({ error: 'Chyba při získávání dat z ARES' });
  }
});

app.post('/api/create-invoice', async (req, res) => {
    try {
        // Vytvoření klienta v Invoice Ninja
        const clientResponse = await fetch(`${NINJA_API_URL}/clients`, {
            method: 'POST',
            headers: {
                'X-API-TOKEN': NINJA_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });
        const clientData = await clientResponse.json();

        // Vytvoření faktury
        const invoiceResponse = await fetch(`${NINJA_API_URL}/invoices`, {
            method: 'POST',
            headers: {
                'X-API-TOKEN': NINJA_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: clientData.data.id,
                items: [{ cost: 200, notes: 'Záloha' }]
            })
        });
        const invoiceData = await invoiceResponse.json();

        // Získání platebního odkazu
        const paymentLinkResponse = await fetch(`${NINJA_API_URL}/invoices/${invoiceData.data.id}/payment_link`, {
            headers: {
                'X-API-TOKEN': NINJA_API_KEY
            }
        });
        const paymentLinkData = await paymentLinkResponse.json();

        res.json({ paymentLink: paymentLinkData.data });
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ error: 'Failed to create invoice' });
    }
});

app.post('/api/add-subscriber', async (req, res) => {
    try {
        const response = await fetch(`${ECOMAIL_API_URL}/subscribers`, {
            method: 'POST',
            headers: {
                'key': ECOMAIL_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            throw new Error('Failed to add subscriber to Ecomail');
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error adding subscriber to Ecomail:', error);
        res.status(500).json({ error: 'Failed to add subscriber to Ecomail' });
    }
});

app.get('/api/suggest-address', async (req, res) => {
  const { query } = req.query;

  try {
    const response = await fetch(`https://api.mapy.cz/v1/suggest?apikey=${MAPY_CZ_API_KEY}&query=${encodeURIComponent(query)}&type=street&limit=5&bounds=48.5370786,12.0921668|51.0746358,18.8927040`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching address suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch address suggestions' });
  }
});

// Zajistí, že SPA router bude fungovat
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server běží na portu ${port}`);
});