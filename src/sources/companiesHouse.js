const { createHttp } = require('../utils/http');
const http = createHttp();

async function companiesHouseSearch(query, apiKey) {
  const url = `https://api.company-information.service.gov.uk/search?q=${encodeURIComponent(query)}`;
  const auth = Buffer.from(`${apiKey}:`).toString('base64');
  const body = await http.get(url, { headers: { Authorization: `Basic ${auth}` } });
  return JSON.parse(body);
}

async function searchPersonsAndCompanies(fullName, apiKey) {
  try {
    const data = await companiesHouseSearch(fullName, apiKey);
    const items = (data && data.items) ? data.items : [];
    const persons = items.filter(i => i.kind && i.kind.includes('searchresults#officer')).map(i => ({
      title: i.title,
      address: i.address_snippet,
      appointmentCount: i.matches ? i.matches.length : undefined,
      links: i.links,
    }));
    const companies = items.filter(i => i.kind && i.kind.includes('searchresults#company')).map(i => ({
      title: i.title,
      companyNumber: i.company_number,
      companyStatus: i.company_status,
      dateOfCreation: i.date_of_creation,
      address: i.address_snippet,
      links: i.links,
    }));
    return { persons, companies };
  } catch (e) {
    throw new Error(`Companies House error: ${e.message}`);
  }
}

module.exports = { searchPersonsAndCompanies };


