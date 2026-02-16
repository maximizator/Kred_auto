// Защита доступа + защита от "Назад"
if (!sessionStorage.getItem('auth')) {
  alert("Требуется авторизация");
  window.location.replace('../admin-login/admin-login.html');
}
history.replaceState(null, '', location.href);

const categories = ["Легковые шины", "Грузовые шины", "Сельхоз шины", "Диски"];
let currentIdx = 0;

const fieldsMap = {
  "Легковые шины": [
    "Типоразмер (напр. 205/55 R16)",
    "Сезон (Зимние нешипованные / Зимние шипованные / Летние)",
    "Модель",
    "Остаток (только число)",
    "Цена (только число)",
    "Фото"
  ],
  "Грузовые шины": [
    "Типоразмер",
    "Модель",
    "Остаток (только число)",
    "Цена (только число)",
    "Фото"
  ],
  "Сельхоз шины": [
    "Типоразмер",
    "Модель",
    "Остаток (только число)",
    "Цена (только число)",
    "Фото"
  ],
  "Диски": [
    "Диаметр",
    "Кол-во отверстий",
    "PCD",
    "ET",
    "DIA",
    "Модель",
    "Остаток (только число)",
    "Цена (только число)",
    "Фото"
  ]
};

// Преобразует сохранённый объект → в значения для полей формы
function mapItemToForm(item, category) {
  if (category === "Легковые шины") {
    let season = "";
    if (item["Зима"] === "Да") {
      season = item["Шипы"] === "шипованная" ? "Зимние шипованные" : "Зимние нешипованные";
    } else if (item["Лето"] === "Да") {
      season = "Летние";
    }
    return [
      item["Типоразмер"] || "",
      season,
      item["Модель"] || "",
      String(item["Остаток"] || ""),
      String(item["Цена"] || ""),
      "" // фото — не заполняем (только при загрузке нового)
    ];
  }

  if (category === "Диски") {
    return [
      item["Диаметр"] || "",
      item["Болт_количество"] || "",
      item["PCD"] || "",
      item["ET"] || "",
      item["DIA"] || "",
      item["Модель"] || "",
      String(item["Остаток"] || ""),
      String(item["Цена"] || ""),
      ""
    ];
  }

  // Грузовые / Сельхоз
  return [
    item["Типоразмер"] || "",
    item["Модель"] || "",
    String(item["Остаток"] || ""),
    String(item["Цена"] || ""),
    ""
  ];
}

// Рендер форм с возможной подгрузкой данных
async function renderForms() {
  const container = document.getElementById('forms-container');
  container.innerHTML = '';

  const cat = categories[currentIdx];
  const fileName = cat.replace(/\s+/g, '_');
  
  // Загружаем существующие данные
  let existingItems = [];
  try {
    const res = await fetch(`load.php?category=${fileName}`);
    existingItems = await res.json();
  } catch (e) {
    console.warn('Не удалось загрузить данные:', e);
  }

  const fields = fieldsMap[cat] || [];

  if (existingItems.length === 0) {
    // Нет данных — создаём пустую карточку
    addFormCard(container, fields, []);
  } else {
    // Есть данные — создаём карточку под каждый товар
    for (const item of existingItems) {
      const values = mapItemToForm(item, cat);
      addFormCard(container, fields, values);
    }
  }

  updateMinusButtons(container);
}

function addFormCard(container, fields, values = []) {
  const card = document.createElement('div');
  card.className = 'form-card';

  const fieldsDiv = document.createElement('div');
  fieldsDiv.className = 'fields';

  fields.forEach((label, i) => {
    let input;
    if (label === "Фото") {
      input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
    } else {
      input = document.createElement('input');
      input.placeholder = label;
      input.value = values[i] || '';
    }
    fieldsDiv.appendChild(input);
  });

  const controls = document.createElement('div');
  controls.className = 'controls';

  const plus = document.createElement('button');
  plus.className = 'btn-plus';
  plus.textContent = '+';
  plus.onclick = () => {
    addFormCard(container, fields, []);
    updateMinusButtons(container);
  };

  const minus = document.createElement('button');
  minus.className = 'btn-minus';
  minus.textContent = '–';
  minus.onclick = () => {
    if (container.children.length <= 1) return;
    container.removeChild(card);
    updateMinusButtons(container);
  };

  controls.appendChild(plus);
  controls.appendChild(minus);

  card.appendChild(fieldsDiv);
  card.appendChild(controls);
  container.appendChild(card);
}

function updateMinusButtons(container) {
  const buttons = container.querySelectorAll('.btn-minus');
  buttons.forEach(btn => {
    btn.disabled = container.children.length <= 1;
    btn.style.opacity = btn.disabled ? '0.4' : '1';
  });
}

document.getElementById('prev').onclick = () => {
  currentIdx = currentIdx === 0 ? categories.length - 1 : currentIdx - 1;
  document.getElementById('current').textContent = categories[currentIdx];
  renderForms();
};

document.getElementById('next').onclick = () => {
  currentIdx = currentIdx === categories.length - 1 ? 0 : currentIdx + 1;
  document.getElementById('current').textContent = categories[currentIdx];
  renderForms();
};

// Сохранение
async function saveData(replace) {
  const cat = categories[currentIdx];
  const cards = document.querySelectorAll('.form-card');
  const formData = new FormData();

  const items = [];
  let photoIndex = 0;

  for (const card of cards) {
    const inputs = card.querySelectorAll('input');
    const item = {};
    let hasData = false;

    for (let i = 0; i < inputs.length; i++) {
      const labelRaw = fieldsMap[cat][i];
      const cleanLabel = labelRaw.split(' (')[0];

      if (labelRaw === "Фото") {
        const fileInput = inputs[i];
        if (fileInput.files[0]) {
          const file = fileInput.files[0];
          const ext = file.name.substring(file.name.lastIndexOf('.'));
          const safeName = `${cat.replace(/\s+/g, '_')}_${Date.now()}_${photoIndex++}${ext}`;
          formData.append('photos[]', file, safeName);
          item["Фото"] = safeName;
        } else {
          item["Фото"] = "";
        }
      } else {
        const value = inputs[i].value.trim();
        if (value) hasData = true;
        item[cleanLabel] = value;
      }
    }

    // Валидация
    if (cat === "Легковые шины" && item["Сезон"]) {
      const valid = ["Зимние нешипованные", "Зимние шипованные", "Летние"];
      if (!valid.includes(item["Сезон"])) {
        alert('Неверный сезон');
        return;
      }
    }
    if (item["Остаток"] && isNaN(item["Остаток"])) { alert('Остаток — число'); return; }
    if (item["Цена"] && isNaN(item["Цена"])) { alert('Цена — число'); return; }

    // Формируем финальный объект под нужную структуру JSON
    const finalItem = {};

    if (cat === "Легковые шины") {
      finalItem["Модель"] = item["Модель"] || "";
      finalItem["Типоразмер"] = item["Типоразмер"] || "";
      finalItem["Цена"] = Number(item["Цена"]) || 0;
      finalItem["Остаток"] = String(item["Остаток"] || "");
      finalItem["Фото"] = item["Фото"];

      if (item["Сезон"] === "Зимние нешипованные") {
        finalItem["Зима"] = "Да";
        finalItem["Шипы"] = "без шипов";
      } else if (item["Сезон"] === "Зимние шипованные") {
        finalItem["Зима"] = "Да";
        finalItem["Шипы"] = "шипованная";
      } else if (item["Сезон"] === "Летние") {
        finalItem["Лето"] = "Да";
        finalItem["Шипы"] = "без шипов";
      }
    }

    else if (cat === "Диски") {
      finalItem["Модель"] = item["Модель"] || "";
      finalItem["Диаметр"] = item["Диаметр"] || "";
      finalItem["Болт_количество"] = item["Кол-во отверстий"] || "";
      finalItem["PCD"] = item["PCD"] || "";
      finalItem["ET"] = item["ET"] || "";
      finalItem["DIA"] = item["DIA"] || "";
      finalItem["Цена"] = Number(item["Цена"]) || 0;
      finalItem["Остаток"] = String(item["Остаток"] || "");
      finalItem["Фото"] = item["Фото"];
    }

    else { // Грузовые / Сельхоз
      finalItem["Модель"] = item["Модель"] || "";
      finalItem["Типоразмер"] = item["Типоразмер"] || "";
      finalItem["Цена"] = Number(item["Цена"]) || 0;
      finalItem["Остаток"] = String(item["Остаток"] || "");
      finalItem["Фото"] = item["Фото"];
    }

    items.push(finalItem);
  }

  formData.append('category', cat);
  formData.append('replace', replace ? '1' : '0');
  formData.append('data', JSON.stringify(items));

  try {
    const res = await fetch('save.php', { method: 'POST', body: formData });
    const result = await res.json();
    if (result.success) {
      alert(`Сохранено ${items.length} товаров (${replace ? 'заменено' : 'добавлено'})`);
    } else {
      alert('Ошибка: ' + (result.error || 'неизвестно'));
    }
  } catch (e) {
    alert('Не удалось отправить данные');
    console.error(e);
  }
}

// Инициализация
renderForms();