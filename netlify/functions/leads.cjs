/**
 * Netlify Serverless Function Adapter (`netlify/functions/leads.cjs`)
 *
 * Thin HTTP adapter mapping AWS Lambda / Netlify Serverless events to the
 * shared universal Lead Intake Core pipeline (`lead-intake-core.cjs`).
 */

const { processIntakeLead } = require('./lead-intake-core.cjs');

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  if (Buffer.byteLength(event.body || '', 'utf8') > 32 * 1024) {
    return {
      statusCode: 413,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, error: 'Payload too large' }),
    };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, error: 'Invalid JSON payload' }),
    };
  }

  const clientIp =
    event.headers['x-nf-client-connection-ip'] ||
    event.headers['client-ip'] ||
    event.headers['x-forwarded-for']?.split(',')[0].trim() ||
    'unknown';

  const result = await processIntakeLead(body, {
    clientIp,
    platform: 'netlify-serverless',
    dataDir: '/tmp/klay-data',
  });

  return {
    statusCode: result.statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(result.body),
  };
};
