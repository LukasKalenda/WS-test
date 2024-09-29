const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(cors());
app.use(express.json());

// const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';  // DEV Version

const JWT_SECRET = process.env.JWT_SECRET;
// Middleware pro ověření JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'password') {
    const token = jwt.sign({ username: username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Neplatné přihlašovací údaje' });
  }
});

// Získat všechny zákazníky
app.get('/api/customers', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Získat jednoho zákazníka
app.get('/api/customers/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Zákazník nenalezen' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vytvořit nového zákazníka
app.post('/api/customers', authenticateToken, async (req, res) => {
  const { customer_type, ic, jmeno, prijmeni, email, telefon, adresa, popis_problemu, datum_terminu, casove_okno } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO customers (customer_type, ic, jmeno, prijmeni, email, telefon, adresa, popis_problemu, datum_terminu, casove_okno) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [customer_type, ic, jmeno, prijmeni, email, telefon, adresa, popis_problemu, datum_terminu, casove_okno]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Aktualizovat zákazníka
app.put('/api/customers/:id', authenticateToken, async (req, res) => {
  const { customer_type, ic, jmeno, prijmeni, email, telefon, adresa, popis_problemu, datum_terminu, casove_okno } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE customers SET customer_type = $1, ic = $2, jmeno = $3, prijmeni = $4, email = $5, telefon = $6, adresa = $7, popis_problemu = $8, datum_terminu = $9, casove_okno = $10, updated_at = CURRENT_TIMESTAMP WHERE id = $11 RETURNING *',
      [customer_type, ic, jmeno, prijmeni, email, telefon, adresa, popis_problemu, datum_terminu, casove_okno, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Zákazník nenalezen' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Smazat zákazníka
app.delete('/api/customers/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING *', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Zákazník nenalezen' });
    }
    res.json({ message: 'Zákazník úspěšně smazán' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server běží na portu ${PORT}`));