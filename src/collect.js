const { searchAll } = require('./sources/ddg');
const { discoverSocialProfiles } = require('./sources/social');
const { findNewsAndInterviews } = require('./sources/news');
const { findPodcasts } = require('./sources/podcasts');
const { lookupWayback } = require('./sources/wayback');
const { generateReport } = require('./report/generate');

async function runCollection({ fullName, linkedin, companiesHouseKey = '' }) {
  const baseline = await searchAll(fullName, linkedin);
  const social = await discoverSocialProfiles(fullName);
  const news = await findNewsAndInterviews(fullName);
  const podcasts = await findPodcasts(fullName);
  const wayback = await lookupWayback(baseline.topDomains || []);

  let companies = { persons: [], companies: [] };
  if (companiesHouseKey) {
    try {
      const { searchPersonsAndCompanies } = require('./sources/companiesHouse');
      companies = await searchPersonsAndCompanies(fullName, companiesHouseKey);
    } catch (e) {
      // swallow, allow report to proceed
    }
  }

  const context = { fullName, linkedin };
  const report = generateReport({ context, baseline, social, news, podcasts, wayback, companies });
  return { report, context, baseline, social, news, podcasts, wayback, companies };
}

module.exports = { runCollection };


