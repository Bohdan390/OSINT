const path = require('path');
const fs = require('fs');
const { URL } = require('url');
require('dotenv').config();

const { runCollection } = require('./collect');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--linkedin') out.linkedin = args[++i];
    else if (a === '--name') out.name = args[++i];
    else if (a === '--out') out.out = args[++i];
    else if (a === '--companiesHouseKey') out.companiesHouseKey = args[++i];
  }
  return out;
}

function nameFromLinkedin(linkedinUrl) {
  try {
    const u = new URL(linkedinUrl);
    const parts = u.pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('in');
    const slug = idx >= 0 && parts[idx + 1] ? parts[idx + 1] : parts[0];
    if (!slug) return null;
    const core = slug.replace(/-\d+$/,'').replace(/_/g,'-');
    return core.split('-').filter(Boolean).map(s => s[0] ? s[0].toUpperCase() + s.slice(1) : s).join(' ');
  } catch (_) {
    return null;
  }
}

async function main() {
  const args = parseArgs();
  if (!args.linkedin) {
    console.error('Usage: node src/index.js --linkedin <url> [--name "Full Name"] [--out outputs/report.md]');
    process.exit(1);
  }

  const fullName = args.name || nameFromLinkedin(args.linkedin);
  if (!fullName) {
    console.error('Could not infer name from LinkedIn URL. Please pass --name "Full Name"');
    process.exit(1);
  }

  const outPath = args.out || path.join('outputs', `${fullName.replace(/\s+/g,'_').toLowerCase()}_report.md`);
  const outputsDir = path.dirname(outPath);
  if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir, { recursive: true });

  console.log(`[+] Subject: ${fullName}`);
  console.log(`[+] LinkedIn: ${args.linkedin}`);

  const companiesHouseKey = args.companiesHouseKey || process.env.COMPANIES_HOUSE_API_KEY || '';
  const { report } = await runCollection({ fullName, linkedin: args.linkedin, companiesHouseKey });
  fs.writeFileSync(outPath, report, 'utf8');
  console.log(`[+] Report written: ${outPath}`);
}

main().catch(err => {
  console.error('[!] Fatal error:', err);
  process.exit(1);
});


