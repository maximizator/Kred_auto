<?php

$url = 'https://z34.ru/xml?h=65ee9f149fd78bb1c186ed11380cf06cd7dfd6b0';
$filename = __DIR__ . '/../data/passenger.json';

echo "Обновляю\n";

while (true) {
    try {
        // 1. Запрос XML
        $xmlStr = @file_get_contents($url);
        if ($xmlStr === false) {
            echo "❌ Ошибка загрузки XML\n";
            sleep(2);
            continue;
        }

        // 2. Парсим XML
        $root = simplexml_load_string($xmlStr);
        if (!$root) {
            echo "❌ Невалидный XML\n";
            sleep(2);
            continue;
        }

        // 3. Собираем шины
        $allTires = [];
        foreach ($root->xpath('//Шина') as $tireBox) {
            $tire = [];
            foreach ($tireBox->getDocNamespaces() as $ns => $uri) {
                // Если есть неймспейсы — игнорируем, но в твоём случае их нет
            }
            $iterator = new RecursiveIteratorIterator(new RecursiveArrayIterator(json_decode(json_encode($tireBox), true)));
            foreach ($iterator as $key => $value) {
                if (is_string($value) && trim($value) !== '') {
                    $tag = $key;
                    $val = trim($value);

                    // ✨ Обработка цены
                    if ($tag === 'Цена') {
                        $num = floatval(str_replace([' ', ','], ['', '.'], $val));
                        if ($num > 0) {
                            $val = round($num * 1.15);
                        }
                    }

                    $tire[$tag] = $val;
                }
            }
            // Убираем дублирование корневого тега (если нужно)
            if (!empty($tire)) {
                $allTires[] = $tire;
            }
        }

        // Альтернатива проще (без рекурсии):
        // Но если структура плоская — можно так:
        $allTires = [];
        foreach ($root->Шина as $tireBox) {
            $tire = [];
            foreach ($tireBox as $tag => $value) {
                $val = trim((string)$value);
                if ($val === '') continue;

                if ($tag === 'Цена') {
                    $num = floatval(str_replace([' ', ','], ['', '.'], $val));
                    if ($num > 0) {
                        $val = round($num * 1.15);
                    }
                }
                $tire[(string)$tag] = $val;
            }
            $allTires[] = $tire;
        }

        // 4. Сохраняем в JSON
        file_put_contents($filename, json_encode($allTires, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

        echo "✅ Записал " . count($allTires) . " шт. в $filename\n";

    } catch (Exception $e) {
        echo "⚠️ Ошибка: " . $e->getMessage() . "\n";
    }

    sleep(2); // чтобы не спамить
}