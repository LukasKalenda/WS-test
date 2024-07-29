const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
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

app.post('/api/create-invoice', async (req, res) => {
    try {
        // Vytvoření klienta v Invoice Ninja
        const clientResponse = await fetch('https://your-invoice-ninja-url/api/v1/clients', {
            method: 'POST',
            headers: {
                'X-API-TOKEN': 'your-invoice-ninja-api-token',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });
        const clientData = await clientResponse.json();

        // Vytvoření faktury
        const invoiceResponse = await fetch('https://your-invoice-ninja-url/api/v1/invoices', {
            method: 'POST',
            headers: {
                'X-API-TOKEN': 'your-invoice-ninja-api-token',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: clientData.data.id,
                items: [{ cost: 200, notes: 'Záloha' }]
            })
        });
        const invoiceData = await invoiceResponse.json();

        // Získání platebního odkazu
        const paymentLinkResponse = await fetch(`https://your-invoice-ninja-url/api/v1/invoices/${invoiceData.data.id}/payment_link`, {
            headers: {
                'X-API-TOKEN': 'your-invoice-ninja-api-token'
            }
        });
        const paymentLinkData = await paymentLinkResponse.json();

        res.json({ paymentLink: paymentLinkData.data });
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ error: 'Failed to create invoice' });
    }
});

// Zajistí, že SPA router bude fungovat
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server běží na portu ${port}`);
});