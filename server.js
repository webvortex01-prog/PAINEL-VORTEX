const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API: Salvar um novo Orçamento (vindo da calculadora)
app.post('/api/budget', (req, res) => {
  const { typeName, pages, features, total, whatsapp, name } = req.body;
  
  const details = JSON.stringify({ typeName, pages, features, total });
  
  const sql = `INSERT INTO leads (type, name, whatsapp, details) VALUES (?, ?, ?, ?)`;
  db.run(sql, ['budget', name || 'Lead Anônimo', whatsapp, details], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, id: this.lastID });
  });
});

// API: Salvar novo Contato (vindo do formulário do rodapé)
app.post('/api/contact', (req, res) => {
  const { name, whatsapp, email, company, message } = req.body;
  
  const sql = `INSERT INTO leads (type, name, whatsapp, email, company, message) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(sql, ['contact', name, whatsapp, email, company, message], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, id: this.lastID });
  });
});

// API: Buscar todos os leads para o Painel Admin (Protegido por senha simples)
app.get('/api/leads', (req, res) => {
  // Senha hardcoded para o MVP
  const authHeader = req.headers.authorization;
  if (authHeader !== 'Bearer vortex2026') {
    return res.status(401).json({ error: 'Acesso Negado' });
  }

  const sql = `SELECT * FROM leads ORDER BY created_at DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ leads: rows });
  });
});

// API: Mudar status do lead (ex: de 'novo' para 'atendido')
app.post('/api/leads/:id/status', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== 'Bearer vortex2026') {
    return res.status(401).json({ error: 'Acesso Negado' });
  }

  const { status } = req.body;
  const { id } = req.params;

  const sql = `UPDATE leads SET status = ? WHERE id = ?`;
  db.run(sql, [status, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});
// API: Buscar anotações
app.get('/api/notes', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== 'Bearer vortex2026') return res.status(401).json({ error: 'Acesso Negado' });

  db.all(`SELECT * FROM notes ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ notes: rows });
  });
});

// API: Salvar anotação
app.post('/api/notes', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== 'Bearer vortex2026') return res.status(401).json({ error: 'Acesso Negado' });

  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Conteúdo vazio' });

  db.run(`INSERT INTO notes (content) VALUES (?)`, [content], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: this.lastID });
  });
});

// API: Apagar anotação
app.delete('/api/notes/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== 'Bearer vortex2026') return res.status(401).json({ error: 'Acesso Negado' });

  const { id } = req.params;
  db.run(`DELETE FROM notes WHERE id = ?`, [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// API: Atualizar status da anotação (Kanban)
app.put('/api/notes/:id/status', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== 'Bearer vortex2026') return res.status(401).json({ error: 'Acesso Negado' });

  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) return res.status(400).json({ error: 'Status vazio' });

  db.run(`UPDATE notes SET status = ? WHERE id = ?`, [status, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Servir os arquivos estáticos do site e do painel
app.use(express.static(path.join(__dirname, '')));

// Iniciar Servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Web Vortex rodando na porta ${PORT}`);
  console.log(`👉 Acesse o site: http://localhost:${PORT}`);
  console.log(`👉 Acesse o painel: http://localhost:${PORT}/admin`);
});
