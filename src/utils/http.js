const DEFAULT_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function createHttp() {
  async function get(url, opts = {}) {
    const headers = Object.assign({ 'user-agent': DEFAULT_UA }, opts.headers || {});
    const maxRetries = 2;
    let lastErr;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch(url, { method: 'GET', headers, redirect: 'follow' });
        if (!res.ok) {
          const text = await res.text();
          const err = new Error(`HTTP ${res.status} for ${url}`);
          err.statusCode = res.status;
          err.body = text;
          if ([429,500,502,503,504].includes(res.status) && attempt < maxRetries) {
            await sleep(500 * (attempt + 1));
            continue;
          }
          throw err;
        }
        return await res.text();
      } catch (e) {
        lastErr = e;
        if (attempt < maxRetries) {
          await sleep(500 * (attempt + 1));
          continue;
        }
        throw e;
      }
    }
    throw lastErr || new Error('Unknown HTTP error');
  }

  return { get };
}

module.exports = { createHttp };


