const { ddgSearch } = require('./ddg');
const { buildSiteNameQuery } = require('../utils/query');

async function findPodcasts(fullName, seeds = {}) {
  const sites = ['podcasts.apple.com', 'open.spotify.com', 'youtube.com', 'podbay.fm', 'listennotes.com'];
  const out = [];
  for (const s of sites) {
    try {
      const extrasArr = [seeds.company, seeds.title, seeds.location, seeds.university, seeds.gradYear].filter(Boolean);
      const q = buildSiteNameQuery(s, fullName, extrasArr);
      const res = await ddgSearch(q, { max: 10 });
      out.push(...res);
    } catch (_) {}
  }
  return out;
}

module.exports = { findPodcasts };


