import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🧪 Starting Multi-Route Lead Generation & Pipeline Verification Suite...\n');

const API_BASE = 'http://localhost:3001';

async function postLead(payload) {
  const res = await fetch(`${API_BASE}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

// =========================================================================
// TEST 1: Homepage Instant Calculator Lead (Fixed DEF-01)
// =========================================================================
{
  console.log('Test 1: Homepage Instant Calculator lead with full contact details...');
  const payload = {
    name: 'Elena Rostova',
    email: 'elena.rostova@rostova-holdings.ae',
    phone: '+971 50 123 4567',
    jurisdiction: 'Free Zone',
    visaCount: 2,
    officeType: 'Flexi Desk',
    notes: 'Estimated First-Year Cost: AED 20,000 (~$5,446 USD)',
    source: 'executive_instant_calculator',
  };

  const res = await postLead(payload);
  assert.ok(res.status === 200 || res.status === 201, `Expected HTTP 200/201, got ${res.status}`);
  assert.equal(res.data.success, true, 'Response must indicate success: true');
  assert.ok(
    res.data.leadId && res.data.leadId.startsWith('KLAY-'),
    `Expected valid KLAY reference ID, got ${res.data.leadId}`
  );
  console.log(`  ✓ Instant calculator lead accepted cleanly! Ref ID: ${res.data.leadId}`);
}

// =========================================================================
// TEST 2: Backward Compatibility - Legacy Single Contact Field (Phone)
// =========================================================================
{
  console.log('Test 2: Backward compatibility single contact field with phone number...');
  const payload = {
    contact: '+971 52 987 6543',
    jurisdiction: 'Dubai Mainland',
    visas: 1,
    source: 'legacy_widget_phone',
  };

  const res = await postLead(payload);
  assert.ok(res.status === 200 || res.status === 201, `Expected HTTP 200/201, got ${res.status}`);
  assert.equal(res.data.success, true, 'Response must indicate success: true');
  assert.ok(res.data.leadId, 'Must generate valid lead reference');
  console.log(`  ✓ Backward-compatible phone contact accepted! Ref ID: ${res.data.leadId}`);
}

// =========================================================================
// TEST 3: Backward Compatibility - Legacy Single Contact Field (Email)
// =========================================================================
{
  console.log('Test 3: Backward compatibility single contact field with email address...');
  const payload = {
    contact: 'marcus.vance@vanguard-holdings.co.uk',
    jurisdiction: 'Offshore',
    source: 'legacy_widget_email',
  };

  const res = await postLead(payload);
  assert.ok(res.status === 200 || res.status === 201, `Expected HTTP 200/201, got ${res.status}`);
  assert.equal(res.data.success, true, 'Response must indicate success: true');
  assert.ok(res.data.leadId, 'Must generate valid lead reference');
  console.log(`  ✓ Backward-compatible email contact accepted! Ref ID: ${res.data.leadId}`);
}

// =========================================================================
// TEST 4: Sovereign Contact Form with DIFC / ADGM Jurisdiction (Fixed DEF-02)
// =========================================================================
{
  console.log('Test 4: Sovereign Contact Form submission with DIFC / ADGM selection...');
  const payload = {
    name: 'Alexander Wright',
    email: 'alex.wright@wright-capital.com',
    phone: '+971 58 555 1234',
    jurisdiction: 'DIFC / ADGM',
    activity: 'Financial Services & FinTech',
    timeline: 'Immediate (1-2 weeks)',
    notes: 'Setting up an ADGM Category 3C asset management vehicle.',
    source: 'contact-page',
  };

  const res = await postLead(payload);
  assert.ok(res.status === 200 || res.status === 201, `Expected HTTP 200/201, got ${res.status}`);
  assert.equal(res.data.success, true, 'Response must indicate success: true');
  assert.ok(res.data.leadId, 'Must generate valid lead reference');
  console.log(`  ✓ DIFC / ADGM sovereign lead accepted! Ref ID: ${res.data.leadId}`);
}

// =========================================================================
// TEST 5: Cost Calculator Variant C Financial Sliders Lead Capture
// =========================================================================
{
  console.log('Test 5: Cost Calculator Variant C Financial Sliders lead capture...');
  const payload = {
    name: 'Sophie Dupont',
    email: 'sophie.dupont@dupont-luxury.fr',
    phone: '+971 55 432 1098',
    jurisdiction: 'Meydan Free Zone (Dubai)',
    estimateAed: 24500,
    estimateUsd: 6671,
    source: 'VariantC_FinancialSliders',
    notes: '2 Investor Visas + Dedicated Desk + Corporate Tax Package',
  };

  const res = await postLead(payload);
  assert.ok(res.status === 200 || res.status === 201, `Expected HTTP 200/201, got ${res.status}`);
  assert.equal(res.data.success, true, 'Response must indicate success: true');
  console.log(`  ✓ Financial Sliders simulation lead accepted! Ref ID: ${res.data.leadId}`);
}

// =========================================================================
// TEST 6: Golden Visa Variant C Quiz Qualifier Lead Capture
// =========================================================================
{
  console.log('Test 6: Golden Visa Variant C Quiz Qualifier lead capture...');
  const payload = {
    name: 'Dr. Tariq Mansour',
    email: 'tariq.mansour@dubai-health.ae',
    phone: '+971 50 765 4321',
    jurisdiction: 'Golden Visa',
    activity: 'Executive & Specialized Professional Track',
    notes:
      'Senior Executive (Salary AED 45,000/mo) + Attested Degree. Inclusions: Spouse + 2 Children.',
    source: 'VariantC_GoldenVisaQuiz',
  };

  const res = await postLead(payload);
  assert.ok(res.status === 200 || res.status === 201, `Expected HTTP 200/201, got ${res.status}`);
  assert.equal(res.data.success, true, 'Response must indicate success: true');
  console.log(`  ✓ Golden Visa Qualifier lead accepted! Ref ID: ${res.data.leadId}`);
}

// =========================================================================
// TEST 7: Validation Rejection on Missing Contact Information
// =========================================================================
{
  console.log('Test 7: Verification of HTTP 400 validation rejection on empty body...');
  const payload = {
    jurisdiction: 'Free Zone',
    notes: 'Anonymous lead without name or phone',
  };

  const res = await postLead(payload);
  assert.equal(res.status, 400, `Expected HTTP 400 validation rejection, got ${res.status}`);
  assert.equal(res.data.success, false, 'Success must be false on invalid payload');
  console.log('  ✓ Correctly rejected invalid submission with HTTP 400 validation error');
}

// =========================================================================
// TEST 8: Disk Persistence and CSV Audit
// =========================================================================
{
  console.log(
    'Test 8: Checking disk persistence across JSONL, JSON, and Google Sheet CSV mirror...'
  );
  const leadsJsonlPath = path.join(projectRoot, 'data', 'leads.jsonl');
  const leadsCsvPath = path.join(projectRoot, 'data', 'google-sheet-crm.csv');

  assert.ok(fs.existsSync(leadsJsonlPath), 'data/leads.jsonl must exist on disk');
  assert.ok(fs.existsSync(leadsCsvPath), 'data/google-sheet-crm.csv must exist on disk');

  const jsonlContent = fs.readFileSync(leadsJsonlPath, 'utf8');
  assert.ok(jsonlContent.includes('Elena Rostova'), 'JSONL must contain Elena Rostova');
  assert.ok(jsonlContent.includes('Alexander Wright'), 'JSONL must contain Alexander Wright');
  assert.ok(jsonlContent.includes('DIFC / ADGM'), 'JSONL must contain DIFC / ADGM lead');

  const csvContent = fs.readFileSync(leadsCsvPath, 'utf8');
  assert.ok(csvContent.includes('Elena Rostova'), 'CSV must contain Elena Rostova');
  assert.ok(csvContent.includes('Alexander Wright'), 'CSV must contain Alexander Wright');
  console.log('  ✓ All leads verified persisted to disk and CRM CSV mirror!');
}

console.log('\n🎉 ALL 8 MULTI-ROUTE LEAD TESTS PASSED CLEANLY (100% assertions green)!');
