<?php
/**
 * Sovereign Lead Intake Conduit (PHP / LiteSpeed Hostinger)
 * Native endpoint at https://klayconsultants.com/api/leads
 *
 * Persists leads directly to Turso Cloud libSQL via HTTP pipeline
 * and maintains an immutable local append-only vault.
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
} else {
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Handle CORS Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Only POST allowed
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

// Read raw JSON body
$rawBody = file_get_contents('php://input');
$data = json_decode($rawBody, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON payload']);
    exit;
}

// Extraction & Sanitization
$name = trim(strip_tags((string)($data['name'] ?? '')));
$email = trim(strip_tags((string)($data['email'] ?? '')));
$phone = trim(strip_tags((string)($data['phone'] ?? '')));
$budget = trim(strip_tags((string)($data['budget'] ?? '')));
$jurisdiction = trim(strip_tags((string)($data['jurisdiction'] ?? 'UAE')));
$activity = trim(strip_tags((string)($data['activity'] ?? 'General')));
$timeline = trim(strip_tags((string)($data['timeline'] ?? '')));
$notes = trim(strip_tags((string)($data['notes'] ?? '')));
$source = trim(strip_tags((string)($data['source'] ?? 'website')));
$visaCount = isset($data['visaCount']) ? (int)$data['visaCount'] : 0;

// Validation limits
if (empty($name)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Name is required']);
    exit;
}
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Valid email address is required']);
    exit;
}
if (empty($phone)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Phone number is required']);
    exit;
}

// Enforce max lengths
$name = substr($name, 0, 100);
$email = substr($email, 0, 120);
$phone = substr($phone, 0, 50);
$budget = substr($budget, 0, 80);
$jurisdiction = substr($jurisdiction, 0, 100);
$activity = substr($activity, 0, 120);
$timeline = substr($timeline, 0, 80);
$notes = substr($notes, 0, 2000);
$source = substr($source, 0, 100);

// Generate Sovereign Reference ID
$refNum = !empty($data['referenceNumber']) ? trim(strip_tags((string)$data['referenceNumber'])) : '';
if (!preg_match('/^KLAY-\d{4}-[A-Z0-9]+$/', $refNum)) {
    $randomHex = strtoupper(bin2hex(random_bytes(4)));
    $refNum = 'KLAY-' . date('Y') . '-' . $randomHex;
}
$leadId = $refNum;
$timestamp = gmdate('Y-m-d\TH:i:s.v\Z');

$leadRecord = [
    'id' => $leadId,
    'reference_number' => $refNum,
    'timestamp' => $timestamp,
    'name' => $name,
    'email' => $email,
    'phone' => $phone,
    'budget' => $budget,
    'jurisdiction' => $jurisdiction,
    'activity' => $activity,
    'timeline' => $timeline,
    'visa_count' => $visaCount,
    'notes' => $notes,
    'source' => $source,
    'platform' => 'hostinger-litespeed',
    'status' => 'New',
    'created_at' => $timestamp,
    'updated_at' => $timestamp,
];

// Tier 1: Local Append-Only Vault
$vaultDirs = [
    dirname(dirname(__DIR__)) . '/leads_vault.jsonl',
    __DIR__ . '/../../leads_vault.jsonl',
    __DIR__ . '/../data/leads_vault.jsonl',
    sys_get_temp_dir() . '/klay_leads_vault.jsonl'
];
foreach ($vaultDirs as $vaultPath) {
    $dir = dirname($vaultPath);
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    $written = @file_put_contents($vaultPath, json_encode($leadRecord, JSON_UNESCAPED_SLASHES) . "\n", FILE_APPEND | LOCK_EX);
    if ($written !== false) {
        break;
    }
}

// Tier 2: Turso Cloud LibSQL HTTP Pipeline
$tursoUrl = 'https://klay-db-klayconsultant.aws-eu-central-1.turso.io/v2/pipeline';
$tursoToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTQ4MjMyMDYsImlkIjoiMDFhMWUzY2MtOTYwMS03NmRmLWI3ZmQtYWI5ZjJiMzlkZGNhIiwia2lkIjoieVdMUFZUdmU4MXVJakVaUEVDTWdFUzZOcTdvTjV6cVZYeXZJWk5kcnEzZyIsInJpZCI6IjhhMDkwZTQxLTcxN2MtNGMyMC05NDdiLTVmNmE1MWUwOTYxNyJ9.7iakZdSFmOzxjBbh73PM514YJB0WfVuVAIfems3VreNPyX4J7mCJkGH3iwdYAyS3BFz7p7D1O1eqDzEBV8ksBg';

$sql = "INSERT INTO leads (id, reference_number, timestamp, name, email, phone, budget, jurisdiction, activity, timeline, visa_count, notes, source, platform, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$args = [
    ['type' => 'text', 'value' => (string)$leadRecord['id']],
    ['type' => 'text', 'value' => (string)$leadRecord['reference_number']],
    ['type' => 'text', 'value' => (string)$leadRecord['timestamp']],
    ['type' => 'text', 'value' => (string)$leadRecord['name']],
    ['type' => 'text', 'value' => (string)$leadRecord['email']],
    ['type' => 'text', 'value' => (string)$leadRecord['phone']],
    ['type' => 'text', 'value' => (string)$leadRecord['budget']],
    ['type' => 'text', 'value' => (string)$leadRecord['jurisdiction']],
    ['type' => 'text', 'value' => (string)$leadRecord['activity']],
    ['type' => 'text', 'value' => (string)$leadRecord['timeline']],
    ['type' => 'integer', 'value' => (string)$leadRecord['visa_count']],
    ['type' => 'text', 'value' => (string)$leadRecord['notes']],
    ['type' => 'text', 'value' => (string)$leadRecord['source']],
    ['type' => 'text', 'value' => (string)$leadRecord['platform']],
    ['type' => 'text', 'value' => (string)$leadRecord['status']],
    ['type' => 'text', 'value' => (string)$leadRecord['created_at']],
    ['type' => 'text', 'value' => (string)$leadRecord['updated_at']],
];

$pipelinePayload = json_encode([
    'requests' => [
        [
            'type' => 'execute',
            'stmt' => [
                'sql' => $sql,
                'args' => $args,
            ]
        ],
        ['type' => 'close']
    ]
]);

$tursoSuccess = false;
if (function_exists('curl_init')) {
    $ch = curl_init($tursoUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $pipelinePayload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $tursoToken,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 6);

    $tursoResponse = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $tursoResponse) {
        $resObj = json_decode($tursoResponse, true);
        if (isset($resObj['results'][0]['type']) && $resObj['results'][0]['type'] === 'ok') {
            $tursoSuccess = true;
        }
    }
}

// Tier 3: Private ntfy Push Alert (strips PII, reference only)
if (function_exists('curl_init')) {
    $ntfyTopic = getenv('NTFY_LEAD_TOPIC') ?: 'klay_leads_2026';
    $ntfyCh = curl_init("https://ntfy.sh/{$ntfyTopic}");
    curl_setopt($ntfyCh, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ntfyCh, CURLOPT_POST, true);
    curl_setopt($ntfyCh, CURLOPT_POSTFIELDS, "New intake dossier received. Reference: {$refNum}");
    curl_setopt($ntfyCh, CURLOPT_HTTPHEADER, [
        'Title: New Intake Dossier',
        'Tags: briefcase,incoming_envelope',
        'Priority: 4'
    ]);
    curl_setopt($ntfyCh, CURLOPT_TIMEOUT, 3);
    @curl_exec($ntfyCh);
    @curl_close($ntfyCh);
}

// Return 201 Created
http_response_code(201);
echo json_encode([
    'success' => true,
    'leadId' => $leadId,
    'referenceNumber' => $refNum,
    'tursoPersisted' => $tursoSuccess,
    'message' => "Lead received and registered under {$refNum}"
]);
