const { searchAll, searchAllSeeded } = require('./sources/ddg');
const { logStep } = require('./utils/log');
const { discoverSocialProfiles } = require('./sources/social');
const { findNewsAndInterviews } = require('./sources/news');
const { findPodcasts } = require('./sources/podcasts');
const { lookupWayback } = require('./sources/wayback');
const { generateReport } = require('./report/generate');

async function runCollection({ fullName, linkedin, companiesHouseKey = '', seeds = {}, fast = false }) {
  const started = Date.now();
  logStep('collect:start', { fullName, linkedin: !!linkedin, fast, seeds });

  const t0 = Date.now();
  const baseline = Object.keys(seeds).length ? await searchAllSeeded(fullName, seeds, { fast }) : await searchAll(fullName, linkedin);
  logStep('collect:baseline:done', { ms: Date.now() - t0, results: (baseline.results||[]).length, domains: (baseline.topDomains||[]).length });

  // const t1 = Date.now();
  // const social = await discoverSocialProfiles(fullName, seeds);
  // logStep('collect:social:done', { ms: Date.now() - t1, results: social.length });

  // const news = await findNewsAndInterviews(fullName, seeds);
  // const t2 = Date.now();
  // logStep('collect:news:done', { ms: Date.now() - t2, results: news.length });

  // const t3 = Date.now();
  // const podcasts = await findPodcasts(fullName, seeds);
  // logStep('collect:podcasts:done', { ms: Date.now() - t3, results: podcasts.length });

  const t4 = Date.now();
  const wayback = fast ? {} : await lookupWayback(baseline.topDomains || []);
  logStep('collect:wayback:done', { ms: Date.now() - t4, hosts: Object.keys(wayback||{}).length, skipped: !!fast });

  let companies = { persons: [], companies: [] };
  if (companiesHouseKey && !fast) {
    try {
      const { searchPersonsAndCompanies } = require('./sources/companiesHouse');
      companies = await searchPersonsAndCompanies(fullName, companiesHouseKey);
    } catch (e) {
      // swallow, allow report to proceed
    }
  }

  const context = { fullName, linkedin };
  const social = [];
  const news = [];
  const podcasts = [];
  const report = generateReport({ context, baseline, social, news, podcasts, wayback, companies });
  logStep('collect:report:generated', { ms: Date.now() - started, bytes: report.length });
  return { report, context, baseline, social, news, podcasts, wayback, companies };
}

module.exports = { runCollection };


