const cheerio = require('cheerio');
const { createHttp } = require('../utils/http');
const { logStep } = require('../utils/log');

const http = createHttp();

function normalizeDuckUrl(href) {
  try {
    const u = new URL(href, 'https://duckduckgo.com');
    if (u.hostname.endsWith('duckduckgo.com') && u.pathname.startsWith('/l/')) {
      const t = u.searchParams.get('uddg');
      if (t) return decodeURIComponent(t);
    }
    return u.toString();
  } catch (_) {
    return href;
  }
}

async function ddgSearch(query, { max = 20 } = {}) {
  const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  console.log('url', url);
  const html = await http.get(url);
  const $ = cheerio.load(html);
  const results = [];
  $('a.result__a').each((_, el) => {
    const title = $(el).text().trim();
    const hrefRaw = $(el).attr('href');
    const href = hrefRaw ? normalizeDuckUrl(hrefRaw) : hrefRaw;
    const parent = $(el).closest('.result');
    const snippet = parent.find('.result__snippet').text().trim();
    if (href && title) results.push({ title, url: href, snippet });
  });
  console.log('results', results);
  return results.slice(0, max);
}

async function ddgLiteSearch(query, { max = 20 } = {}) {
  const url = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`;
  const html = await http.get(url);
  const results = [];
  const parts = html.split('<td class="result-link">');
  for (let i = 1; i < parts.length; i++) {
    const seg = parts[i];
    const m = seg.match(/<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/i);
    if (m) {
      const href = m[1];
      const title = m[2].replace(/<[^>]+>/g,'').trim();
      if (href && title) results.push({ title, url: href, snippet: '' });
    }
    if (results.length >= max) break;
  }
  return results;
}

function uniqByUrl(arr) {
  const seen = new Set();
  return arr.filter(r => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });
}

function getTopDomains(results) {
  const counts = {};
  for (const r of results) {
    try {
      const u = new URL(r.url);
      const host = u.hostname.replace(/^www\./,'');
      if (!host.includes('duckduckgo.com')) {
        counts[host] = (counts[host] || 0) + 1;
      }
    } catch (_) {}
  }
  return Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([d])=>d).slice(0, 20);
}

function strictFilter(results, fullName) {
  const needle = fullName.toLowerCase();
  return results.filter(r => {
    const hay = `${r.title || ''} ${r.snippet || ''} ${r.url || ''}`.toLowerCase();
    if (!hay.includes(needle)) return false;
    if (hay.includes('toby foster')) return false;
    return true;
  });
}

async function searchAll(fullName, linkedinUrl) {
  const s0 = Date.now();
  const orgs = ['Heist Studios','Supercritical','Engensa','Lumo','Bain & Company','Carbon13','Seedcamp'];
  const quoted = `"${fullName}"`;
  const queries = [
    `${quoted}`,
    `${quoted} interview`,
    `${quoted} podcast`,
    `${quoted} biography`,
    `${quoted} investor`,
    `${quoted} conference`,
    `${quoted} linkedin`,
  ].concat(orgs.map(o => `${quoted} ${o}`));
  const siteQueries = [
    `site:twitter.com "${fullName}"`,
    `site:x.com "${fullName}"`,
    `site:instagram.com "${fullName}"`,
    `site:youtube.com "${fullName}"`,
    `site:medium.com "${fullName}"`,
    `site:substack.com "${fullName}"`,
    `site:podcasts.apple.com "${fullName}"`,
    `site:open.spotify.com "${fullName}"`,
    `site:find-and-update.company-information.service.gov.uk "${fullName}"`,
    `site:opencorporates.com "${fullName}"`,
  ];

  const allQueries = queries.concat(siteQueries);
  const chunks = [];
  logStep('ddg:queries:begin', { count: allQueries.length });
  await Promise.all(allQueries.map(async (q) => {
    let res = [];
    try { res = await ddgSearch(q, { max: 12 }); } catch (_) {}
    if (!res || res.length === 0) {
      try { res = await ddgLiteSearch(q, { max: 12 }); } catch (_) {}
    }
    if (res && res.length) chunks.push(...res);
  }));
  const results = strictFilter(uniqByUrl(chunks), fullName);
  const topDomains = getTopDomains(results);
  logStep('ddg:queries:done', { ms: Date.now() - s0, results: results.length, domains: topDomains.length });
  return { results, topDomains };
}

function buildSeededQueries(fullName, seeds, { fast = false } = {}) {
  const q = `"${fullName}"`;
  const queries = [];
  if (seeds.company) {
    queries.push(`${q} "${seeds.company}"`);
    if (seeds.title) queries.push(`${q} "${seeds.company}" "${seeds.title}"`);
  }
  if (seeds.location) queries.push(`${q} "${seeds.location}"`);
  if (seeds.university) {
    queries.push(`${q} "${seeds.university}"`);
    if (seeds.gradYear) queries.push(`${q} "${seeds.university}" ${seeds.gradYear}`);
  }
  const socials = [
    `site:twitter.com ${q}`,
    `site:x.com ${q}`,
    `site:instagram.com ${q}`,
    `site:youtube.com ${q}`,
    `site:medium.com ${q}`,
    `site:substack.com ${q}`,
  ];
  const news = [
    `${q} interview`,
    `${q} podcast`,
    `${q} profile`,
  ];
  const companies = [
    `site:find-and-update.company-information.service.gov.uk ${q}`,
    `site:opencorporates.com ${q}`,
  ];
  let all = queries.concat(socials, news, companies);
  if (fast) all = all.slice(0, 10);
  return all;
}

async function searchAllSeeded(fullName, seeds = {}, { fast = false } = {}) {
  const allQueries = buildSeededQueries(fullName, seeds, { fast });
  const chunks = [];
  const s1 = Date.now();
  logStep('ddg:seeded:begin', { count: allQueries.length, fast });
  await Promise.all(allQueries.map(async (q) => {
    let res = [];
    try { res = await ddgSearch(q, { max: 10 }); } catch (_) {}
    if (!res || res.length === 0) {
      try { res = await ddgLiteSearch(q, { max: 10 }); } catch (_) {}
    }
    if (res && res.length) chunks.push(...res);
  }));
  const results = strictFilter(uniqByUrl(chunks), fullName);
  const topDomains = getTopDomains(results);
  logStep('ddg:seeded:done', { ms: Date.now() - s1, results: results.length, domains: topDomains.length });
  return { results, topDomains };
}

module.exports = { ddgSearch, ddgLiteSearch, searchAll, buildSeededQueries, searchAllSeeded };


