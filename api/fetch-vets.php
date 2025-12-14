<?php
// Ensure correct JSON header
header('Content-Type: application/json');

// Correct path to your JSON file
$file = __DIR__ . '/../data/vets.json';

// Check if file exists
if (!file_exists($file)) {
    echo json_encode([]);
    exit;
}

// Read and decode JSON
$vets = json_decode(file_get_contents($file), true);

// If JSON invalid, fallback to empty array
if (!is_array($vets)) {
    $vets = [];
}

// Output JSON
echo json_encode($vets);


