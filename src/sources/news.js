const { ddgSearch } = require('./ddg');

async function findNewsAndInterviews(fullName) {
  const topics = [
    'interview', 'profile', 'feature', 'podcast', 'conference', 'fireside', 'panel', 'Q&A'
  ];
  const outlets = [
    'ft.com','theguardian.com','bbc.co.uk','forbes.com','techcrunch.com','wired.com','bloomberg.com','medium.com','substack.com','youtube.com'
  ];
  const out = [];
  for (const t of topics) {
    try {
      const res = await ddgSearch(`${fullName} ${t}`, { max: 10 });
      out.push(...res);
    } catch (_) {}
  }
  for (const o of outlets) {
    try {
      const res = await ddgSearch(`site:${o} "${fullName}"`, { max: 10 });
      out.push(...res);
    } catch (_) {}
  }
  return out;
}

module.exports = { findNewsAndInterviews };


