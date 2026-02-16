<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Только POST']);
    exit;
}

$category = $_POST['category'] ?? '';
$replace = ($_POST['replace'] ?? '0') === '1';
$data = json_decode($_POST['data'] ?? '[]', true);

// Если данных для сохранения нет — удаляем старый JSON и все связанные фото
if (empty($data)) {
    $dataFile = $uploadDir . 'data_' . str_replace(' ', '_', $category) . '.json';
    
    if (file_exists($dataFile)) {
        // Читаем старые данные, чтобы удалить фото
        $oldData = json_decode(file_get_contents($dataFile), true) ?: [];
        foreach ($oldData as $item) {
            if (!empty($item['Фото'])) {
                $photoPath = $uploadDir . basename($item['Фото']);
                if (file_exists($photoPath)) {
                    unlink($photoPath);
                }
            }
        }
        // Удаляем сам JSON
        unlink($dataFile);
    }

    echo json_encode(['success' => true, 'message' => 'Данные очищены']);
    exit;
}

if (!$category || !is_array($data)) {
    echo json_encode(['success' => false, 'error' => 'Нет данных']);
    exit;
}

// Папка для фото
$uploadDir = __DIR__ . '/../data/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

// Сохраняем фото
$photos = $_FILES['photos'] ?? [];
$photoNames = [];
if (!empty($photos['name']) && is_array($photos['name'])) {
    foreach ($photos['name'] as $idx => $name) {
        if ($photos['error'][$idx] === UPLOAD_ERR_OK) {
            $tmp = $photos['tmp_name'][$idx];
            $dest = $uploadDir . basename($name);
            if (move_uploaded_file($tmp, $dest)) {
                $photoNames[] = $name;
            }
        }
    }
}

// Добавляем имена фото к товарам
foreach ($data as $i => $item) {
    if (isset($photoNames[$i])) {
        $data[$i]['Фото'] = 'data/' . $photoNames[$i];
    }
}

// Сохраняем данные в JSON-файл
$dataFile = $uploadDir . 'data_' . str_replace(' ', '_', $category) . '.json';

$existing = [];
if (!$replace && file_exists($dataFile)) {
    $existing = json_decode(file_get_contents($dataFile), true) ?: [];
}

$final = $replace ? $data : array_merge($existing, $data);

if (file_put_contents($dataFile, json_encode($final, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT))) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Не удалось записать файл']);
}
?>