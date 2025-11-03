const { ddgSearch } = require('./ddg');

async function discoverSocialProfiles(fullName) {
  const sites = [
    'twitter.com', 'x.com', 'instagram.com', 'youtube.com', 'medium.com', 'substack.com', 'github.com'
  ];
  const out = [];
  for (const s of sites) {
    try {
      const res = await ddgSearch(`site:${s} "${fullName}"`, { max: 10 });
      out.push(...res);
    } catch (_) {}
  }
  return out;
}

module.exports = { discoverSocialProfiles };


