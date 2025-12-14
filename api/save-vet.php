<?php
// save-vet.php - Save vets data
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$file = __DIR__ . '/../data/vets.json';

// Get JSON data from request
$json = file_get_contents('php://input');
$vets = json_decode($json, true);

// Validate data
if (!is_array($vets)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data format']);
    exit;
}

// Save to file
if (file_put_contents($file, json_encode($vets, JSON_PRETTY_PRINT))) {
    echo json_encode(['success' => true, 'message' => 'Vets saved successfully']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save data']);
}
