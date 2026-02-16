<?php
header('Content-Type: application/json; charset=utf-8');

$category = $_GET['category'] ?? '';
if (!$category) {
    echo json_encode([]);
    exit;
}

$filePath = __DIR__ . '/../data/data_' . $category . '.json';
$data = [];

if (file_exists($filePath)) {
    $content = file_get_contents($filePath);
    $data = json_decode($content, true) ?: [];
}

echo json_encode($data, JSON_UNESCAPED_UNICODE);
?>