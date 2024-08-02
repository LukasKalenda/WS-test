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

// ... (existující kód pro API ARES zůstává beze změny)

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

// ... (existující kód pro SPA router zůstává beze změny)

app.listen(port, () => {
    console.log(`Server běží na portu ${port}`);
});