# OSINT CLI (JS)

Minimal, ethical OSINT CLI to build a public profile from a LinkedIn URL. Uses DuckDuckGo HTML for search, pivots to social, news, podcasts, Wayback, and optionally Companies House.

## Usage

```bash
node src/index.js --linkedin https://www.linkedin.com/in/tobydarbyshire/ --out outputs/report.md
```

Optional:

- `--name "Full Name"` to override name derived from the LinkedIn slug
- `--companiesHouseKey <API_KEY>` or set `COMPANIES_HOUSE_API_KEY` in `.env`

## Notes

- Scrapes only publicly accessible sources and avoids bypassing access controls
- Does not log in to LinkedIn or other platforms; pivots via open web search
- Outputs a Markdown report with citations


