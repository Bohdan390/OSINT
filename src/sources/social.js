const { ddgSearch } = require('./ddg');
const { buildSiteNameQuery } = require('../utils/query');

async function discoverSocialProfiles(fullName, seeds = {}) {
  const sites = [
    'twitter.com', 'x.com', 'instagram.com', 'youtube.com', 'medium.com', 'substack.com', 'github.com'
  ];
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

module.exports = { discoverSocialProfiles };


