/**
 * Netlify Serverless Function Adapter (`netlify/functions/admin.cjs`)
 *
 * Routes `/api/admin/*` events:
 * - POST   /api/admin/login
 * - POST   /api/admin/logout
 * - GET    /api/admin/leads
 * - PATCH  /api/admin/leads/:id
 * - GET    /api/admin/blogs
 * - POST   /api/admin/blogs
 * - DELETE /api/admin/blogs/:slug
 */

// Ensure sovereign fallback secret for Netlify showcase & staging previews
process.env.KLAY_ADMIN_SECRET =
  process.env.KLAY_ADMIN_SECRET ||
  process.env.ADMIN_JWT_SECRET ||
  'klay_executive_portal_sovereign_secret_2026_jwt';

const {
  resolveClientIp,
  requireAdminAuth,
  handleAdminLogin,
  handleAdminLogout,
  handleGetLeads,
  handlePatchLead,
  handleGetBlogs,
  handlePostBlog,
  handleDeleteBlog,
} = require('./admin-core.cjs');

const ALLOWED_ADMIN_ORIGINS = new Set([
  'https://klay-consulting-staging.netlify.app',
  'https://klayconsultants.com',
]);

function getCorsHeaders(event) {
  const origin = event?.headers?.origin || event?.headers?.Origin || '';
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    Vary: 'Origin',
  };

  if (ALLOWED_ADMIN_ORIGINS.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

function safeDecode(val) {
  if (typeof val !== 'string') return val;
  try {
    return decodeURIComponent(val);
  } catch (err) {
    if (err instanceof URIError) {
      return null;
    }
    return null;
  }
}

exports.handler = async (event, context) => {
  const corsHeaders = getCorsHeaders(event);
  const origin = event?.headers?.origin || event?.headers?.Origin || '';

  // Reject cross-origin browser requests before authentication, including
  // credentialed writes that could otherwise bypass a CORS read restriction.
  if (origin && !ALLOWED_ADMIN_ORIGINS.has(origin)) {
    return {
      statusCode: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Origin not allowed' }),
    };
  }

  // Pre-flight CORS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: '',
    };
  }

  // Normalize path
  let pathname = event.path || '';
  pathname = pathname.replace(/^\/\.netlify\/functions\/admin/, '/api/admin');
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  // Parse JSON request body for write methods
  let body = {};
  if (event.body && (event.httpMethod === 'POST' || event.httpMethod === 'PATCH')) {
    try {
      body = JSON.parse(event.body);
    } catch {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid JSON payload' }),
      };
    }
  }

  const clientIp = resolveClientIp(event);

  // 1. POST /api/admin/login (Public, rate-limited)
  if (event.httpMethod === 'POST' && pathname === '/api/admin/login') {
    const result = await handleAdminLogin(body, clientIp);
    return formatResponse(result, corsHeaders);
  }

  // 2. POST /api/admin/logout
  if (event.httpMethod === 'POST' && pathname === '/api/admin/logout') {
    const result = handleAdminLogout(event);
    return formatResponse(result, corsHeaders);
  }

  // Protected Routes Barrier: All remaining /api/admin/* routes require valid auth
  if (pathname.startsWith('/api/admin')) {
    const auth = requireAdminAuth(event);
    if (!auth.authenticated) {
      return {
        statusCode: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: auth.error || 'Unauthorized: valid admin session required' }),
      };
    }

    // 3. GET /api/admin/leads
    if (event.httpMethod === 'GET' && pathname === '/api/admin/leads') {
      const filters = event.queryStringParameters || {};
      const result = handleGetLeads(filters);
      return formatResponse(result, corsHeaders);
    }

    // 4. PATCH /api/admin/leads/:id
    const leadMatch = pathname.match(/^\/api\/admin\/leads\/(.+)$/);
    if (event.httpMethod === 'PATCH' && (leadMatch || event.queryStringParameters?.id)) {
      const rawLeadId = leadMatch ? leadMatch[1] : event.queryStringParameters.id;
      const leadId = safeDecode(rawLeadId);
      if (leadId === null) {
        return {
          statusCode: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Malformed URI encoding' }),
        };
      }
      const result = handlePatchLead(leadId, body);
      return formatResponse(result, corsHeaders);
    }

    // 5. GET /api/admin/blogs
    if (event.httpMethod === 'GET' && pathname === '/api/admin/blogs') {
      const result = handleGetBlogs();
      return formatResponse(result, corsHeaders);
    }

    // 6. POST /api/admin/blogs
    if (event.httpMethod === 'POST' && pathname === '/api/admin/blogs') {
      const result = handlePostBlog(body);
      return formatResponse(result, corsHeaders);
    }

    // 7. DELETE /api/admin/blogs/:slug
    const blogMatch = pathname.match(/^\/api\/admin\/blogs\/(.+)$/);
    if (event.httpMethod === 'DELETE' && (blogMatch || event.queryStringParameters?.slug)) {
      const rawSlug = blogMatch ? blogMatch[1] : event.queryStringParameters.slug;
      const slug = safeDecode(rawSlug);
      if (slug === null) {
        return {
          statusCode: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Malformed URI encoding' }),
        };
      }
      const result = handleDeleteBlog(slug);
      return formatResponse(result, corsHeaders);
    }
  }

  return {
    statusCode: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'Endpoint not found' }),
  };
};

function formatResponse(result, corsHeaders = getCorsHeaders()) {
  const headers = {
    ...corsHeaders,
    ...(result.headers || {}),
  };

  const response = {
    statusCode: result.statusCode,
    headers,
    body: typeof result.body === 'string' ? result.body : JSON.stringify(result.body),
  };

  if (headers['Set-Cookie']) {
    response.multiValueHeaders = {
      'Set-Cookie': [headers['Set-Cookie']],
    };
  }

  return response;
}

exports.getCorsHeaders = getCorsHeaders;
exports.safeDecode = safeDecode;
