const { searchAll, searchAllSeeded } = require('./sources/ddg');
const { discoverSocialProfiles } = require('./sources/social');
const { findNewsAndInterviews } = require('./sources/news');
const { findPodcasts } = require('./sources/podcasts');
const { lookupWayback } = require('./sources/wayback');
const { generateReport } = require('./report/generate');

async function runCollection({ fullName, linkedin, companiesHouseKey = '', seeds = {}, fast = false }) {
  const baseline = Object.keys(seeds).length ? await searchAllSeeded(fullName, seeds, { fast }) : await searchAll(fullName, linkedin);
  console.log('baseline', baseline);
  const social = await discoverSocialProfiles(fullName);
  console.log('social', social);
  const news = await findNewsAndInterviews(fullName);
  console.log('news', news);
  const podcasts = await findPodcasts(fullName);
  console.log('podcasts', podcasts);
  const wayback = fast ? {} : await lookupWayback(baseline.topDomains || []);
  console.log('wayback', wayback);

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
  const report = generateReport({ context, baseline, social, news, podcasts, wayback, companies });
  return { report, context, baseline, social, news, podcasts, wayback, companies };
}

module.exports = { runCollection };


