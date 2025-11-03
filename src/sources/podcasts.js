const { ddgSearch } = require('./ddg');

async function findPodcasts(fullName) {
  const sites = ['podcasts.apple.com', 'open.spotify.com', 'youtube.com', 'podbay.fm', 'listennotes.com'];
  const out = [];
  for (const s of sites) {
    try {
      const res = await ddgSearch(`site:${s} "${fullName}"`, { max: 10 });
      out.push(...res);
    } catch (_) {}
  }
  return out;
}

module.exports = { findPodcasts };


