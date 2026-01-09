import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# 🔧 Настройки
options = webdriver.ChromeOptions()
options.add_argument("--headless=new")
driver = webdriver.Chrome(options=options)
wait = WebDriverWait(driver, 15)  # чуть дольше — на случай медленной загрузки

results = []

try:
    print("✅ Открываю зимние шины...")
    driver.get("https://ivanor.ru/products/cnav_tyres/season_winter")

    # 🚗 Шаг 1: Марки
    vendor_select = wait.until(EC.presence_of_element_located((By.ID, "vendor-car")))
    vendor_options = vendor_select.find_elements(By.TAG_NAME, "option")[1:]
    vendors = [
        (opt.get_attribute("value"), opt.text.strip())
        for opt in vendor_options
        if opt.get_attribute("value") and opt.text.strip()
    ]

    for vendor_value, vendor_name in vendors:
        print(f"\n🔧 Марка: {vendor_name}")

        # Выбираем марку — ищем заново!
        vendor_el = driver.find_element(By.ID, "vendor-car")
        driver.execute_script(
            f"arguments[0].value = '{vendor_value}'; arguments[0].dispatchEvent(new Event('change'));",
            vendor_el
        )
        time.sleep(0.8)

        # 🚙 Шаг 2: Модели
        model_select = wait.until(EC.presence_of_element_located((By.ID, "model-car")))
        model_options = model_select.find_elements(By.TAG_NAME, "option")[1:]
        models = [
            (opt.get_attribute("value"), opt.text.strip())
            for opt in model_options
            if opt.get_attribute("value") and opt.text.strip()
        ]

        for model_value, model_name in models:
            print(f"   🔧 Модель: {model_name}")

            model_el = driver.find_element(By.ID, "model-car")
            driver.execute_script(
                f"arguments[0].value = '{model_value}'; arguments[0].dispatchEvent(new Event('change'));",
                model_el
            )
            time.sleep(0.8)

            # 📅 Шаг 3: Года
            year_select = wait.until(EC.presence_of_element_located((By.ID, "year-car")))
            year_options = year_select.find_elements(By.TAG_NAME, "option")[1:]
            years = [
                opt.text.strip()
                for opt in year_options
                if opt.text.strip() and opt.get_attribute("value")
            ]

            for year in years:
                print(f"      📅 Год: {year}")

                year_el = driver.find_element(By.ID, "year-car")
                driver.execute_script(
                    f"arguments[0].value = '{year}'; arguments[0].dispatchEvent(new Event('change'));",
                    year_el
                )
                time.sleep(1.2)

                # 🖱️ Шаг 4: Жмём кнопку "Показать"
                try:
                    show_btn = wait.until(
                        EC.element_to_be_clickable((By.XPATH, '//*[@id="show-facets"]/button'))
                    )
                    show_btn.click()
                except Exception as e:
                    print(f"      ❌ Не смог нажать кнопку для {vendor_name} {model_name} {year}")
                    continue

                # ⏳ Шаг 5: Ждём появления хотя бы одного span в нужном блоке
                tire_sizes = []
                try:
                    # Ждём: появился ли хотя бы один span в блоке "Заводская комплектация"
                    wait.until(
                        EC.presence_of_element_located(
                            (By.XPATH, '//*[@id="product-list-page"]/div[3]/div[1]/div/div[5]/div[8]/div[2]//label/span')
                        )
                    )
                    time.sleep(0.5)

                    # Теперь забираем ВСЕ span
                    factory_block = driver.find_element(By.XPATH, '//*[@id="product-list-page"]/div[3]/div[1]/div/div[5]/div[8]/div[2]')
                    spans = factory_block.find_elements(By.XPATH, './/label/span')
                    tire_sizes = [s.text.strip() for s in spans if s.text.strip()]

                except Exception as e:
                    print(f"      ⚠️ Нет данных о заводской комплектации для {vendor_name} {model_name} {year}")

                print(f"      📏 Размеры: {tire_sizes}")

                # 📝 Сохраняем
                results.append({
                    "vendor": vendor_name,
                    "model": model_name,
                    "year": int(year),
                    "factory_sizes": tire_sizes
                })

    # 💾 Сохраняем в JSON
    with open("tires_winter.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n🎉 Готово! Всего записей: {len(results)} → сохранено в tires_winter.json")

finally:
    driver.quit()