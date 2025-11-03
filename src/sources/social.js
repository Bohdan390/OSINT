const { ddgSearch } = require('./ddg');

async function discoverSocialProfiles(fullName, seeds = {}) {
  const sites = [
    'twitter.com', 'x.com', 'instagram.com', 'youtube.com', 'medium.com', 'substack.com', 'github.com'
  ];
  const out = [];
  for (const s of sites) {
    try {
      const extras = [seeds.company, seeds.title, seeds.location, seeds.university, seeds.gradYear].filter(Boolean).map(v => `"${v}"`).join(' ');
      const q = extras ? `site:${s} "${fullName}" ${extras}` : `site:${s} "${fullName}"`;
      const res = await ddgSearch(q, { max: 10 });
      out.push(...res);
    } catch (_) {}
  }
  return out;
}

module.exports = { discoverSocialProfiles };


