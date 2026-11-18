<?php
/**
 * Sovereign Health Conduit (PHP / LiteSpeed Hostinger)
 * Native endpoint at https://klayconsultants.com/api/health
 */

ini_set('display_errors', '0');
error_reporting(0);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

http_response_code(200);
echo json_encode([
    'ok' => true,
    'status' => 'healthy',
    'timestamp' => gmdate('Y-m-d\TH:i:s.v\Z'),
    'platform' => 'hostinger-litespeed',
    'environment' => 'production'
]);
exit;
