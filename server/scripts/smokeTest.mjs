import { chromium } from 'playwright';

const BASE = 'http://localhost:5175';
const API = 'http://localhost:5002/api';
const results = [];

const record = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`${pass ? '✅' : '❌'} ${name}\n   ${detail}\n`);
};

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
page.on('pageerror', e => console.log(`   [page error] ${e.message}`));

// ── 1. /legal index badge counts vs the real placeholder count ────────────
try {
  await page.goto(`${BASE}/legal`, { waitUntil: 'networkidle' });
  await page.waitForSelector('h1', { timeout: 10000 });

  const badges = await page.locator('text=/\\d+ to write/').allTextContents();
  const total = badges.reduce((s, b) => s + parseInt(b, 10), 0);

  // Ground truth straight from the content model.
  const { LEGAL_PAGES } = await import(
    '/Users/blackheart/Projects /BuildWithUs Project /Sri-Ram-Jewellers/src/content/legalContent.js'
  );
  const expected = Object.values(LEGAL_PAGES)
    .reduce((s, p) => s + p.sections.filter(x => x.needsInput).length, 0);

  record('/legal badge counts match the content model',
    total === expected,
    `badges sum to ${total}, model has ${expected} placeholder sections across ${badges.length} policies`);

  // Click through to a placeholder-heavy policy.
  await page.goto(`${BASE}/legal/return-policy`, { waitUntil: 'networkidle' });
  await page.waitForSelector('h1', { timeout: 10000 });
  const draftBanner = await page.locator('text=This policy is a draft').count();
  const dashed = await page.locator('text=Needs client confirmation').count();
  record('placeholder policy renders the draft banner + dashed blocks',
    draftBanner > 0 && dashed > 0,
    `draft banner: ${draftBanner}, "needs client confirmation" blocks: ${dashed}`);
} catch (e) {
  record('/legal index', false, `threw: ${e.message}`);
}

// ── 2. AdminRoute → /403 for a non-admin ──────────────────────────────────
try {
  // Sign in as the seeded non-admin customer via the API, then plant tokens.
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'user@test.com', password: 'LocalDevUser!2026' }),
  });
  const data = await res.json();

  if (!data.accessToken) throw new Error('could not sign in as the non-admin test user');

  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(([a, r]) => {
    localStorage.setItem('sri-ram-access-token', a);
    localStorage.setItem('sri-ram-refresh-token', r);
  }, [data.accessToken, data.refreshToken]);

  await page.goto(`${BASE}/dashboard/adminDashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  const url = page.url();
  const on403 = url.includes('/403');
  const heading = await page.locator('h1').first().textContent().catch(() => '');
  record('non-admin hitting an admin route lands on /403',
    on403,
    `landed on ${url} — heading "${(heading || '').trim()}"`);
} catch (e) {
  record('AdminRoute 403 redirect', false, `threw: ${e.message}`);
}

// ── 3. Session expiry → /login?reason=session-expired + visible notice ────
try {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  // A syntactically valid but undecodable token: the API rejects it 401 and the
  // refresh attempt fails, which is exactly the expired-session path.
  await page.evaluate(() => {
    localStorage.setItem('sri-ram-access-token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZWFkIiwiZXhwIjoxfQ.bogus');
    localStorage.setItem('sri-ram-refresh-token', 'not-a-real-refresh-token');
  });

  await page.goto(`${BASE}/dashboard/myOrders`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);

  const url = page.url();
  const redirected = url.includes('reason=session-expired');
  const noticeVisible = await page
    .locator('text=Your session expired')
    .first()
    .isVisible()
    .catch(() => false);

  record('expired session redirects AND shows the notice',
    redirected && noticeVisible,
    `url: ${url} | notice rendered: ${noticeVisible}`);
} catch (e) {
  record('session expiry', false, `threw: ${e.message}`);
}

// ── 4. MyOrders shows a skeleton, not the empty state, while loading ──────
try {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'user@test.com', password: 'LocalDevUser!2026' }),
  });
  const data = await res.json();
  await page.evaluate(([a, r]) => {
    localStorage.setItem('sri-ram-access-token', a);
    localStorage.setItem('sri-ram-refresh-token', r);
  }, [data.accessToken, data.refreshToken]);

  // Hold the orders response open so the loading window is observable.
  await page.route('**/api/orders*', async route => {
    await new Promise(r => setTimeout(r, 3000));
    try { await route.continue(); } catch { /* navigated away mid-delay */ }
  });

  await page.goto(`${BASE}/dashboard/myOrders`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200); // mid-flight

  const skeleton = await page.locator('.animate-pulse').count();
  const emptyDuringLoad = await page.locator('text=Your order box is empty').count();

  record('MyOrders shows skeleton (not empty state) while loading',
    skeleton > 0 && emptyDuringLoad === 0,
    `during load — skeleton elements: ${skeleton}, "order box is empty": ${emptyDuringLoad}`);

  await page.waitForTimeout(3500);
  await page.unroute('**/api/orders*').catch(() => {});
} catch (e) {
  record('MyOrders loading state', false, `threw: ${e.message}`);
}

// ── 5. PaymentPending offers no retry ────────────────────────────────────
try {
  await page.goto(`${BASE}/payment-pending`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const buttons = await page.locator('a, button').allTextContents();
  const visible = buttons.map(b => b.trim().toLowerCase()).filter(Boolean);
  const retryish = visible.filter(t =>
    /try again|retry|pay again|try payment/.test(t) && !/don't pay again|please don't/.test(t));
  const hasOrders = visible.some(t => t.includes('view my orders'));

  record('PaymentPending offers "view my orders" and no retry action',
    hasOrders && retryish.length === 0,
    `actions: [${visible.join(' | ')}] — retry-like: ${retryish.length ? retryish.join(', ') : 'none'}`);
} catch (e) {
  record('PaymentPending actions', false, `threw: ${e.message}`);
}

await browser.close();

console.log('═══════════════════════════════════════');
const passed = results.filter(r => r.pass).length;
console.log(`${passed}/${results.length} checks passed`);
for (const r of results.filter(r => !r.pass)) console.log(`  FAILED: ${r.name}`);
process.exit(results.some(r => !r.pass) ? 1 : 0);
