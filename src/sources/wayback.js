const { createHttp } = require('../utils/http');
const http = createHttp();

async function lookupCapturesForHost(host) {
  const url = `http://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(host)}/*&output=json&filter=statuscode:200&limit=5&collapse=digest`;
  try {
    const body = await http.get(url);
    const data = JSON.parse(body);
    if (!Array.isArray(data) || data.length === 0) return [];
    const headers = data[0];
    const rows = data.slice(1).map(r => Object.fromEntries(r.map((v,i)=>[headers[i], v])));
    return rows.map(r => ({ timestamp: r.timestamp, original: r.original, mime: r.mimetype }));
  } catch (_) {
    return [];
  }
}

async function lookupWayback(topDomains) {
  const out = {};
  for (const host of topDomains) {
    out[host] = await lookupCapturesForHost(host);
  }
  return out;
}

module.exports = { lookupWayback };


