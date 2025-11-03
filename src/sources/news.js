const { ddgSearch } = require('./ddg');
const { buildSiteNameQuery, buildNameQuery } = require('../utils/query');

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
      const extrasArr = [seeds.company, seeds.title, seeds.location, seeds.university, seeds.gradYear].filter(Boolean);
      const q = buildNameQuery(fullName, [t].concat(extrasArr));
      const res = await ddgSearch(q, { max: 10 });
      out.push(...res);
    } catch (_) {}
  }
  for (const o of outlets) {
    try {
      const extrasArr = [seeds.company, seeds.title, seeds.location, seeds.university, seeds.gradYear].filter(Boolean);
      const q = buildSiteNameQuery(o, fullName, extrasArr);
      const res = await ddgSearch(q, { max: 10 });
      out.push(...res);
    } catch (_) {}
  }
  return out;
}

module.exports = { findNewsAndInterviews };


