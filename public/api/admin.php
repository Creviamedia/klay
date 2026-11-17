<?php
/**
 * Sovereign Executive Admin Conduit (PHP / LiteSpeed Hostinger)
 * Native endpoint at https://klayconsultants.com/api/admin/*
 *
 * Implements administrative authentication, session validation,
 * lead management, and CMS persistence directly against Turso Cloud libSQL.
 */

ini_set('display_errors', '0');
error_reporting(E_ALL);

// Security Headers & CORS
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'https://klayconsultants.com',
    'https://www.klayconsultants.com',
    'https://klay-consulting-staging.netlify.app',
    'http://localhost:5173',
    'http://localhost:3000'
];

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Vary: Origin');
header('Content-Type: application/json; charset=utf-8');

// Handle CORS Preflight
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Turso Cloud LibSQL Configuration
$tursoUrl = 'https://klay-db-klayconsultant.aws-eu-central-1.turso.io/v2/pipeline';
$tursoToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTQ4MjMyMDYsImlkIjoiMDFhMWUzY2MtOTYwMS03NmRmLWI3ZmQtYWI5ZjJiMzlkZGNhIiwia2lkIjoieVdMUFZUdmU4MXVJakVaUEVDTWdFUzZOcTdvTjV6cVZYeXZJWk5kcnEzZyIsInJpZCI6IjhhMDkwZTQxLTcxN2MtNGMyMC05NDdiLTVmNmE1MWUwOTYxNyJ9.7iakZdSFmOzxjBbh73PM514YJB0WfVuVAIfems3VreNPyX4J7mCJkGH3iwdYAyS3BFz7p7D1O1eqDzEBV8ksBg';
$adminSecret = getenv('KLAY_ADMIN_SECRET') ?: 'klay_executive_portal_sovereign_secret_2026_jwt';

/**
 * Execute parameterized query against Turso libSQL HTTP pipeline
 */
function tursoQuery($sql, $args = []) {
    global $tursoUrl, $tursoToken;

    $stmtArgs = [];
    foreach ($args as $a) {
        if ($a === null) {
            $stmtArgs[] = ['type' => 'null'];
        } elseif (is_int($a)) {
            $stmtArgs[] = ['type' => 'integer', 'value' => (string)$a];
        } else {
            $stmtArgs[] = ['type' => 'text', 'value' => (string)$a];
        }
    }

    $payload = json_encode([
        'requests' => [
            [
                'type' => 'execute',
                'stmt' => [
                    'sql' => $sql,
                    'args' => $stmtArgs
                ]
            ],
            ['type' => 'close']
        ]
    ]);

    $ch = curl_init($tursoUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $tursoToken,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200 || !$response) {
        return ['error' => 'Database connection failed'];
    }

    $json = json_decode($response, true);
    $firstResult = $json['results'][0] ?? null;
    if (!$firstResult || ($firstResult['type'] ?? '') !== 'ok') {
        $msg = $firstResult['error']['message'] ?? 'Query error';
        return ['error' => $msg];
    }

    $execResult = $firstResult['response']['result'] ?? [];
    $cols = $execResult['cols'] ?? [];
    $rows = $execResult['rows'] ?? [];

    $mapped = [];
    foreach ($rows as $row) {
        $item = [];
        foreach ($cols as $idx => $col) {
            $name = $col['name'];
            $cell = $row[$idx] ?? null;
            if (!$cell || ($cell['type'] ?? '') === 'null') {
                $item[$name] = null;
            } elseif ($cell['type'] === 'integer') {
                $item[$name] = (int)$cell['value'];
            } else {
                $item[$name] = $cell['value'];
            }
        }
        $mapped[] = $item;
    }

    return ['rows' => $mapped, 'affected' => $execResult['affected_row_count'] ?? 0];
}

/**
 * Base64URL encoding helpers
 */
function b64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function b64UrlDecode($data) {
    $remainder = strlen($data) % 4;
    if ($remainder) {
        $data .= str_repeat('=', 4 - $remainder);
    }
    return base64_decode(strtr($data, '-_', '+/'));
}

/**
 * Generate HMAC-SHA256 session JWT conforming to KLAY2 specification
 */
function generateSessionToken($username, $secret) {
    $header = b64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'KLAY2']));
    $now = time();
    $payload = b64UrlEncode(json_encode([
        'sub' => $username,
        'iat' => $now,
        'exp' => $now + 86400,
        'jti' => bin2hex(random_bytes(16))
    ]));
    $sig = b64UrlEncode(hash_hmac('sha256', "{$header}.{$payload}", $secret, true));
    return "{$header}.{$payload}.{$sig}";
}

/**
 * Timing-safe JWT session token verification
 */
function verifySessionToken($token, $secret) {
    if (!$token || !is_string($token)) return null;
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    list($headerB64, $payloadB64, $sigB64) = $parts;

    $header = json_decode(b64UrlDecode($headerB64), true);
    if (!$header || ($header['alg'] ?? '') !== 'HS256' || ($header['typ'] ?? '') !== 'KLAY2') {
        return null;
    }

    $expectedSig = b64UrlEncode(hash_hmac('sha256', "{$headerB64}.{$payloadB64}", $secret, true));
    if (!hash_equals($expectedSig, $sigB64)) {
        return null;
    }

    $payload = json_decode(b64UrlDecode($payloadB64), true);
    if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
        return null;
    }

    return $payload;
}

/**
 * RFC 6238 TOTP verification
 */
function base32Decode($str) {
    $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $str = strtoupper(preg_replace('/[^A-Z2-7]/', '', $str));
    $buffer = 0;
    $bitsLeft = 0;
    $output = '';
    for ($i = 0; $i < strlen($str); $i++) {
        $val = strpos($alphabet, $str[$i]);
        if ($val === false) continue;
        $buffer = ($buffer << 5) | $val;
        $bitsLeft += 5;
        if ($bitsLeft >= 8) {
            $bitsLeft -= 8;
            $output .= chr(($buffer >> $bitsLeft) & 0xFF);
        }
    }
    return $output;
}

function verifyTotp($secret, $code, $window = 1) {
    if (!$secret || strlen($code) !== 6 || !ctype_digit($code)) return false;
    $key = base32Decode($secret);
    $timeStep = (int)floor(time() / 30);
    for ($i = -$window; $i <= $window; $i++) {
        $step = $timeStep + $i;
        $packed = pack('N*', 0) . pack('N*', $step);
        $hmac = hash_hmac('sha1', $packed, $key, true);
        $offset = ord($hmac[strlen($hmac) - 1]) & 0x0F;
        $hashPart = substr($hmac, $offset, 4);
        $value = unpack('N', $hashPart)[1] & 0x7FFFFFFF;
        $expected = str_pad((string)($value % 1000000), 6, '0', STR_PAD_LEFT);
        if (hash_equals($expected, $code)) return true;
    }
    return false;
}

/**
 * Client IP resolution
 */
function resolveClientIp() {
    $headers = [
        'HTTP_CF_CONNECTING_IP',
        'HTTP_X_REAL_IP',
        'HTTP_X_FORWARDED_FOR',
        'REMOTE_ADDR'
    ];
    foreach ($headers as $h) {
        if (!empty($_SERVER[$h])) {
            $ip = trim(explode(',', (string)$_SERVER[$h])[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) return $ip;
        }
    }
    return '127.0.0.1';
}

/**
 * Sliding-window IP rate limiting (Max 5 attempts / 15 min)
 */
function checkRateLimit($ip) {
    $file = sys_get_temp_dir() . '/klay_rate_' . md5($ip) . '.json';
    $now = time();
    $window = 15 * 60;
    $attempts = [];

    if (file_exists($file)) {
        $data = json_decode((string)@file_get_contents($file), true);
        if (is_array($data)) {
            $attempts = array_filter($data, function($t) use ($now, $window) {
                return ($now - $t) < $window;
            });
        }
    }

    if (count($attempts) >= 5) {
        $oldest = reset($attempts);
        $retryAfter = max(1, ($oldest + $window) - $now);
        return ['limited' => true, 'retryAfter' => $retryAfter];
    }

    return ['limited' => false, 'attempts' => $attempts, 'file' => $file];
}

function recordFailedAttempt($ip) {
    $file = sys_get_temp_dir() . '/klay_rate_' . md5($ip) . '.json';
    $now = time();
    $window = 15 * 60;
    $attempts = [];

    if (file_exists($file)) {
        $data = json_decode((string)@file_get_contents($file), true);
        if (is_array($data)) {
            $attempts = array_filter($data, function($t) use ($now, $window) {
                return ($now - $t) < $window;
            });
        }
    }
    $attempts[] = $now;
    @file_put_contents($file, json_encode($attempts));
}

function clearRateLimit($ip) {
    $file = sys_get_temp_dir() . '/klay_rate_' . md5($ip) . '.json';
    if (file_exists($file)) {
        @unlink($file);
    }
}

/**
 * Session verification from Cookie or Bearer header
 */
function getAuthenticatedUser($secret) {
    $token = $_COOKIE['klay_admin_jwt'] ?? null;
    if (!$token) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
        if (preg_match('/^Bearer\s+(\S+)$/i', $authHeader, $matches)) {
            $token = $matches[1];
        }
    }

    if (!$token) return null;
    return verifySessionToken($token, $secret);
}

// Route extraction
$rawUri = $_SERVER['REQUEST_URI'] ?? '';
$path = parse_url($rawUri, PHP_URL_PATH) ?: '';
$subpath = preg_replace('#^/api/admin/?#', '', $path);
$subpath = trim((string)$subpath, '/');
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$clientIp = resolveClientIp();

// 1. POST /api/admin/login
if ($method === 'POST' && $subpath === 'login') {
    $rate = checkRateLimit($clientIp);
    if ($rate['limited']) {
        http_response_code(429);
        echo json_encode([
            'ok' => false,
            'error' => "Security Rate Limit Enforced. Try again in {$rate['retryAfter']}s."
        ]);
        exit;
    }

    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true) ?: [];
    $username = trim((string)($body['username'] ?? ''));
    $password = (string)($body['password'] ?? '');
    $totpCode = trim((string)($body['totp_code'] ?? ''));

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Username and password required']);
        exit;
    }

    $res = tursoQuery(
        'SELECT id, username, password_hash, totp_secret FROM admin_users WHERE username = ?',
        [$username]
    );

    $rows = $res['rows'] ?? [];
    if (empty($rows)) {
        recordFailedAttempt($clientIp);
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'Invalid credentials. Access denied.']);
        exit;
    }

    $user = $rows[0];
    if (!password_verify($password, $user['password_hash'])) {
        recordFailedAttempt($clientIp);
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'Invalid credentials. Access denied.']);
        exit;
    }

    // Check TOTP 2FA if configured
    if (!empty($user['totp_secret'])) {
        if (empty($totpCode)) {
            http_response_code(200);
            echo json_encode(['ok' => false, 'mfaRequired' => true]);
            exit;
        }
        if (!verifyTotp($user['totp_secret'], $totpCode)) {
            recordFailedAttempt($clientIp);
            http_response_code(401);
            echo json_encode(['ok' => false, 'error' => 'Invalid authenticator code. Access denied.']);
            exit;
        }
    }

    // Success: clear rate limits, update last login, generate session JWT
    clearRateLimit($clientIp);
    tursoQuery('UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [$user['id']]);

    $token = generateSessionToken($user['username'], $adminSecret);
    $expires = time() + 86400;

    setcookie('klay_admin_jwt', $token, [
        'expires' => $expires,
        'path' => '/',
        'domain' => '',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);

    http_response_code(200);
    echo json_encode([
        'ok' => true,
        'user' => ['username' => $user['username']]
    ]);
    exit;
}

// 2. POST /api/admin/logout
if ($method === 'POST' && $subpath === 'logout') {
    setcookie('klay_admin_jwt', '', [
        'expires' => time() - 3600,
        'path' => '/',
        'domain' => '',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    http_response_code(200);
    echo json_encode(['ok' => true]);
    exit;
}

// Authenticated Endpoints Guard
$session = getAuthenticatedUser($adminSecret);
if (!$session) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Unauthorized']);
    exit;
}

// 3. GET /api/admin/leads
if ($method === 'GET' && ($subpath === 'leads' || $subpath === 'leads/')) {
    $limit = min(500, max(1, (int)($_GET['limit'] ?? 500)));
    $status = isset($_GET['status']) && $_GET['status'] !== '' ? trim($_GET['status']) : null;

    if ($status) {
        $res = tursoQuery(
            'SELECT id, reference_number, timestamp, name, email, phone, budget, jurisdiction, activity, timeline, visa_count, notes, source, platform, status, created_at, updated_at FROM leads WHERE status = ? ORDER BY timestamp DESC LIMIT ?',
            [$status, $limit]
        );
    } else {
        $res = tursoQuery(
            'SELECT id, reference_number, timestamp, name, email, phone, budget, jurisdiction, activity, timeline, visa_count, notes, source, platform, status, created_at, updated_at FROM leads ORDER BY timestamp DESC LIMIT ?',
            [$limit]
        );
    }

    $leads = $res['rows'] ?? [];
    http_response_code(200);
    echo json_encode(['ok' => true, 'leads' => $leads]);
    exit;
}

// 4. PATCH /api/admin/leads/{id}
if ($method === 'PATCH' && preg_match('#^leads/(.+)$#', $subpath, $matches)) {
    $leadId = trim(urldecode($matches[1]));
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true) ?: [];

    $status = isset($body['status']) ? trim((string)$body['status']) : null;
    $notes = isset($body['notes']) ? trim((string)$body['notes']) : null;
    $now = gmdate('Y-m-d\TH:i:s.v\Z');

    tursoQuery(
        'UPDATE leads SET status = COALESCE(?, status), notes = COALESCE(?, notes), updated_at = ? WHERE id = ?',
        [$status, $notes, $now, $leadId]
    );

    http_response_code(200);
    echo json_encode(['ok' => true, 'message' => 'Lead updated successfully']);
    exit;
}

// 5. GET /api/admin/blogs
if ($method === 'GET' && ($subpath === 'blogs' || $subpath === 'blogs/')) {
    $res = tursoQuery('SELECT * FROM blogs ORDER BY published_at DESC');
    $blogs = $res['rows'] ?? [];
    http_response_code(200);
    echo json_encode(['ok' => true, 'blogs' => $blogs]);
    exit;
}

// 6. POST /api/admin/blogs
if ($method === 'POST' && ($subpath === 'blogs' || $subpath === 'blogs/')) {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true) ?: [];

    $slug = trim((string)($body['slug'] ?? ''));
    $title = trim((string)($body['title'] ?? ''));
    $excerpt = (string)($body['excerpt'] ?? '');
    $content = (string)($body['content'] ?? '');
    $author = (string)($body['author'] ?? 'Klay Advisory');
    $category = (string)($body['category'] ?? 'Corporate Advisory');
    $publishedAt = (string)($body['published_at'] ?? gmdate('Y-m-d\TH:i:s.v\Z'));
    $readTime = (string)($body['read_time'] ?? '5 min');
    $featured = !empty($body['featured']) ? 1 : 0;
    $coverImage = (string)($body['cover_image'] ?? '');
    $tags = is_array($body['tags'] ?? null) ? json_encode($body['tags']) : (string)($body['tags'] ?? '[]');
    $updatedAt = gmdate('Y-m-d\TH:i:s.v\Z');

    if (empty($slug) || empty($title)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Title and slug are required']);
        exit;
    }

    tursoQuery(
        'INSERT OR REPLACE INTO blogs (slug, title, excerpt, content, author, category, published_at, read_time, featured, cover_image, tags, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [$slug, $title, $excerpt, $content, $author, $category, $publishedAt, $readTime, $featured, $coverImage, $tags, $updatedAt]
    );

    http_response_code(200);
    echo json_encode(['ok' => true, 'message' => 'Blog post saved successfully']);
    exit;
}

// 7. DELETE /api/admin/blogs/{slug}
if ($method === 'DELETE' && preg_match('#^blogs/(.+)$#', $subpath, $matches)) {
    $slug = trim(urldecode($matches[1]));
    tursoQuery('DELETE FROM blogs WHERE slug = ?', [$slug]);
    http_response_code(200);
    echo json_encode(['ok' => true, 'message' => 'Blog post deleted successfully']);
    exit;
}

// Fallback: 404 Not Found
http_response_code(404);
echo json_encode(['ok' => false, 'error' => 'Unknown endpoint under /api/admin']);
exit;
