function cleanToken(s) {
  if (!s) return '';
  return String(s).replace(/[\r\n\t]+/g, ' ').replace(/[,;]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function quoteIfNeeded(s) {
  const t = cleanToken(s);
  if (!t) return '';
  return /[\s:\/]/.test(t) ? `"${t}"` : t;
}

function buildSiteNameQuery(domain, fullName, extrasArr) {
  const name = quoteIfNeeded(fullName);
  const extras = (extrasArr || []).map(quoteIfNeeded).filter(Boolean).join(' ');
  return extras ? `site:${domain} ${name} ${extras}` : `site:${domain} ${name}`;
}

function buildNameQuery(fullName, extrasArr) {
  const name = quoteIfNeeded(fullName);
  const extras = (extrasArr || []).map(quoteIfNeeded).filter(Boolean).join(' ');
  return extras ? `${name} ${extras}` : `${name}`;
}

module.exports = { buildSiteNameQuery, buildNameQuery, cleanToken, quoteIfNeeded };


