function ts() {
  return new Date().toISOString();
}

function logStep(step, data) {
  try {
    const payload = data ? ` ${JSON.stringify(data)}` : '';
    console.log(`[${ts()}] ${step}${payload}`);
  } catch (_) {
    console.log(`[${ts()}] ${step}`);
  }
}

module.exports = { logStep };


