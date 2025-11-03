const { ddgSearch } = require('./ddg');

async function findNewsAndInterviews(fullName, seeds = {}) {
  const topics = [
    'interview', 'profile', 'feature', 'podcast', 'conference', 'fireside', 'panel', 'Q&A'
  ];
  const outlets = [
    'ft.com','theguardian.com','bbc.co.uk','forbes.com','techcrunch.com','wired.com','bloomberg.com','medium.com','substack.com','youtube.com'
  ];
  const out = [];
  for (const t of topics) {
    try {
      const extras = [seeds.company, seeds.title, seeds.location, seeds.university, seeds.gradYear].filter(Boolean).map(v => `"${v}"`).join(' ');
      const q = extras ? `"${fullName}" ${t} ${extras}` : `"${fullName}" ${t}`;
      const res = await ddgSearch(q, { max: 10 });
      out.push(...res);
    } catch (_) {}
  }
  for (const o of outlets) {
    try {
      const extras = [seeds.company, seeds.title, seeds.location, seeds.university, seeds.gradYear].filter(Boolean).map(v => `"${v}"`).join(' ');
      const q = extras ? `site:${o} "${fullName}" ${extras}` : `site:${o} "${fullName}"`;
      const res = await ddgSearch(q, { max: 10 });
      out.push(...res);
    } catch (_) {}
  }
  return out;
}

module.exports = { findNewsAndInterviews };


