function section(title) {
  return `\n\n## ${title}\n`;
}

function fmtList(items) {
  return items.map(i => `- ${i}`).join('\n');
}

function dedupeUrls(items) {
  const seen = new Set();
  return items.filter(i => {
    if (seen.has(i.url)) return false;
    seen.add(i.url);
    return true;
  });
}

function generateReport({ context, baseline, social, news, podcasts, wayback, companies, interests }) {
  const lines = [];
  lines.push(`# OSINT Brief: ${context.fullName}`);
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`LinkedIn: ${context.linkedin}`);

  lines.push(section('Top Domains (signal)'));
  lines.push(fmtList(baseline.topDomains.map(d=>`**${d}**`)) || 'No data');

  lines.push(section('Social / Public Profiles'));
  const socialD = dedupeUrls(social).map(r => `- [${r.title}](${r.url}) — ${r.snippet || ''}`);
  lines.push(socialD.join('\n') || 'No public profiles found');

  lines.push(section('News / Interviews'));
  const newsD = dedupeUrls(news).map(r => `- [${r.title}](${r.url}) — ${r.snippet || ''}`);
  lines.push(newsD.join('\n') || 'No news found');

  lines.push(section('Podcasts / Videos'));
  const podD = dedupeUrls(podcasts).map(r => `- [${r.title}](${r.url}) — ${r.snippet || ''}`);
  lines.push(podD.join('\n') || 'No podcasts found');

  lines.push(section('Personal Interests & Hobbies'));
  const interestsD = dedupeUrls(interests || []).map(r => `- [${r.title}](${r.url}) — ${r.snippet || ''}`);
  lines.push(interestsD.join('\n') || 'No interest signals found');

  lines.push(section('Wayback Captures (by domain)'));
  for (const [host, caps] of Object.entries(wayback)) {
    lines.push(`- **${host}**`);
    if (!caps || caps.length === 0) {
      lines.push(`  - No captures`);
      continue;
    }
    for (const c of caps) {
      const w = `https://web.archive.org/web/${c.timestamp}/${c.original}`;
      lines.push(`  - ${c.timestamp} — ${w}`);
    }
  }

  if (companies && (companies.persons.length || companies.companies.length)) {
    lines.push(section('Companies House (UK)'));
    if (companies.persons.length) {
      lines.push('### Officers');
      for (const p of companies.persons) {
        lines.push(`- ${p.title} — ${p.address || ''}`);
      }
    }
    if (companies.companies.length) {
      lines.push('### Companies');
      for (const c of companies.companies) {
        lines.push(`- ${c.title} (${c.companyNumber}) — ${c.companyStatus || ''} — ${c.dateOfCreation || ''}`);
      }
    }
  }

  lines.push(section('Rapport Angles (hypotheses)'));
  lines.push(`- Sustainability/consumer innovation: discuss mission, measurable impact, and scaling.`);
  lines.push(`- Investment thesis: ask about sectors, check sizes, and founder-market fit.`);
  lines.push(`- Talks/interviews: reference specific quotes from sources above.`);
  lines.push(`- Education/alumni: look for alumni networks or mentorship ties.`);

  lines.push(section('Citations'));
  const allRefs = dedupeUrls([].concat(baseline.results, social, news, podcasts));
  for (const r of allRefs) lines.push(`- ${r.title} — ${r.url}`);

  return lines.join('\n');
}

module.exports = { generateReport };


