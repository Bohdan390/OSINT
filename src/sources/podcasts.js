const { ddgSearch } = require('./ddg');

async function findPodcasts(fullName, seeds = {}) {
  const sites = ['podcasts.apple.com', 'open.spotify.com', 'youtube.com', 'podbay.fm', 'listennotes.com'];
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

module.exports = { findPodcasts };


