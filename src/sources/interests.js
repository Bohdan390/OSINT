const { ddgSearch } = require('./ddg');
const { buildSiteNameQuery, buildNameQuery } = require('../utils/query');

const INTEREST_KEYWORDS = [
  'hobbies', 'interests', 'likes', 'fan', 'supporter', 'season ticket',
  'football', 'soccer', 'rugby', 'golf', 'tennis', 'cricket', 'cycling', 'marathon', 'triathlon',
  'charity', 'volunteer', 'philanthropy', 'mentor', 'alumni', 'speaker', 'podcast host',
  'books', 'reading', 'music', 'art', 'photography'
];

const INTEREST_SITES = [
  'twitter.com', 'x.com', 'instagram.com', 'youtube.com', 'medium.com', 'substack.com',
  'strava.com', 'goodreads.com', 'letterboxd.com', 'last.fm'
];

async function findInterests(fullName, seeds = {}) {
  const extrasArr = [seeds.company, seeds.title, seeds.location, seeds.university, seeds.gradYear].filter(Boolean);
  const out = [];
  for (const k of INTEREST_KEYWORDS) {
    try {
      const q = buildNameQuery(fullName, [k].concat(extrasArr));
      const res = await ddgSearch(q, { max: 8 });
      out.push(...res);
    } catch (_) {}
  }
  for (const s of INTEREST_SITES) {
    try {
      const q = buildSiteNameQuery(s, fullName, extrasArr);
      const res = await ddgSearch(q, { max: 8 });
      out.push(...res);
    } catch (_) {}
  }
  return out;
}

module.exports = { findInterests };


