const path = require('path');
const express = require('express');
require('dotenv').config();

const { runCollection } = require('./collect');

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.post('/api/collect', async (req, res) => {
  try {
    const linkedin = (req.body && req.body.linkedin) || '';
    const name = (req.body && req.body.name) || '';
    if (!linkedin) return res.status(400).json({ error: 'linkedin is required' });
    const fullName = name || (function nameFromLinkedin(linkedinUrl){
      try {
        const u = new URL(linkedinUrl);
        const parts = u.pathname.split('/').filter(Boolean);
        const idx = parts.indexOf('in');
        const slug = idx >= 0 && parts[idx + 1] ? parts[idx + 1] : parts[0];
        if (!slug) return '';
        const core = slug.replace(/-\d+$/,'').replace(/_/g,'-');
        return core.split('-').filter(Boolean).map(s => s[0] ? s[0].toUpperCase() + s.slice(1) : s).join(' ');
      } catch (_) { return ''; }
    })(linkedin);
    if (!fullName) return res.status(400).json({ error: 'unable to infer name; provide name' });
    const companiesHouseKey = process.env.COMPANIES_HOUSE_API_KEY || '';
    const data = await runCollection({ fullName, linkedin, companiesHouseKey });
    return res.json({ ok: true, fullName, ...data });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || String(e) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[web] listening on http://localhost:${PORT}`);
});


