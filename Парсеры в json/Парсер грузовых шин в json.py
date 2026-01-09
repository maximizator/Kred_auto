import requests
import time
import json
from xml.etree import ElementTree as ET

url = "https://z34.ru/xml/gruz?h=65ee9f149fd78bb1c186ed11380cf06cd7dfd6b0"
имя_файла = "../Готовые json/Грузовые шины в json.json"

print("Обновляю")

while True:
    try:
        # 1. Идём за XML
        ответ = requests.get(url, timeout=5)
        if ответ.status_code != 200:
            print("❌ Ошибка загрузки:", ответ.status_code)
            time.sleep(2)
            continue

        # 2. Берём КОРЕНЬ — всю коробку целиком 📦
        корень = ET.fromstring(ответ.content)

        # 3. Собираем шины ПО КОРОБКАМ <Груз_Шина>
        все_шины = []
        for коробка_шины in корень.findall(".//Груз_Шина"):
            шина = {}
            for элемент in коробка_шины.iter():
                if элемент.text and элемент.text.strip():
                    тег = элемент.tag
                    значение = элемент.text.strip()

                    # ✨ Если цена — умножаем и округляем до целого
                    if тег == "Цена":
                        try:
                            число = float(значение.replace(" ", "").replace(",", "."))
                            значение = round(число * 1.15)
                        except:
                            pass  # оставляем как текст, если не число

                    шина[тег] = значение
            все_шины.append(шина)

        # Шаг 4: сохраняем в ОДИН файл (перезаписываем)
        with open(имя_файла, "w", encoding="utf-8") as f:
            json.dump(все_шины, f, ensure_ascii=False, indent=2)

        print(f"✅ Записал {len(все_шины)} шт. в {имя_файла}")

    except Exception as e:
        print("⚠️ Ошибка:", str(e))