const items = ["Легковые шины", "Грузовые шины", "Сельхоз шины", "Диски"];
let index = 0;

const currentEl = document.getElementById("current");
const radioGroup = document.getElementById("radio-group");

// Блоки фильтров
const filtersSize = document.getElementById("filters_size_passenger_cars");
const filtersCar = document.getElementById("filters_by_car");
const filtersTruck = document.getElementById("filters_truck");
const filtersAgro = document.getElementById("filters_agro");
const filtersWheel = document.getElementById("filters_wheel");

// Кнопка
const submitBtn = document.getElementById("submit");

// Скрываем все фильтры
function hideAll() {
  radioGroup.style.display = "none";
  filtersSize.style.display = "none";
  filtersCar.style.display = "none";
  filtersTruck.style.display = "none";
  filtersAgro.style.display = "none";
  filtersWheel.style.display = "none";
}

function updateView() {
  hideAll();

  if (items[index] === "Легковые шины") {
    radioGroup.style.display = "block";
    const selected = document.querySelector('input[name="type"]:checked');
    if (selected.value === "size") {
      filtersSize.style.display = "block";
    } else {
      filtersCar.style.display = "block";
    }
  } else if (items[index] === "Грузовые шины") {
    filtersTruck.style.display = "block";
  } else if (items[index] === "Сельхоз шины") {
    filtersAgro.style.display = "block";
  } else if (items[index] === "Диски") {
    filtersWheel.style.display = "block";
  }
}

// Кнопки слайдера
document.getElementById("prev").onclick = () => {
  index = index === 0 ? items.length - 1 : index - 1;
  currentEl.textContent = items[index];
  updateView();
};

document.getElementById("next").onclick = () => {
  index = index === items.length - 1 ? 0 : index + 1;
  currentEl.textContent = items[index];
  updateView();
};

// Переключение способа подбора (для легковых)
document.querySelectorAll('input[name="type"]').forEach(radio => {
  radio.onchange = () => {
    updateView();
  };
});

// Кнопка "Подобрать"
submitBtn.onclick = () => {
  let result = {};

  // Смотрим, что выбрано
  if (items[index] === "Легковые шины") {
    const type = document.querySelector('input[name="type"]:checked').value;
    if (type === "size") {
      result.width = document.getElementById("width").value;
      result.season = document.getElementById("season").value;
    } else {
      result.car = document.getElementById("car").value;
      result.season = document.getElementById("season_car").value;
    }
  } else if (items[index] === "Грузовые шины") {
    result.size = document.getElementById("size_truck").value;
  } else if (items[index] === "Сельхоз шины") {
    result.size = document.getElementById("size_agro").value;
  } else if (items[index] === "Диски") {
    result.size = document.getElementById("radius_disk").value;
    result.size = document.getElementById("holes_disk").value;
    result.size = document.getElementById("pcd_disk").value;
    result.size = document.getElementById("et_disk").value;
    result.size = document.getElementById("dia_disk").value;
  }
};

// Карточки товаров
const resultsEl = document.getElementById("results");

document.getElementById("submit").onclick = () => {
  resultsEl.innerHTML = "";
  resultsEl.style.display = "none";

  const current = document.getElementById("current").textContent;

  let url = "";
  let filterFn = () => true;

  // === Определяем, какой файл грузить и как фильтровать ===
  if (current === "Легковые шины") {
    url = "Готовые json/Легковые шины в json.json";
    const type = document.querySelector('input[name="type"]:checked')?.value;
    if (type !== "size") return;

    const sizeEl = document.getElementById("width");
    const seasonEl = document.getElementById("season");

    const sizeOpt = sizeEl.options[sizeEl.selectedIndex];
    const seasonOpt = seasonEl.options[seasonEl.selectedIndex];

    if (!sizeOpt.value || !seasonOpt.value) {
      alert("Выберите типоразмер и сезон");
      return;
    }

    const sizeText = sizeOpt.textContent.trim();
    const seasonVal = seasonOpt.value;

    filterFn = (item) => 
      item["Типоразмер"] === sizeText &&
      (
        (seasonVal === "summer" && item["Лето"] === "Да") ||
        (seasonVal === "winter_non_stud" && item["Зима"] === "Да" && item["Шипы"] === "без шипов") ||
        (seasonVal === "winter_stud" && item["Зима"] === "Да" &&
          (item["Шипы"] === "шипованная" || item["Шипы"] === "Шипуемая без шипов"))
      );
  }

  else if (current === "Грузовые шины") {
    url = "Готовые json/Грузовые шины в json.json";
    const sizeEl = document.getElementById("size_truck");
    const opt = sizeEl.options[sizeEl.selectedIndex];
    if (!opt.value) {
      alert("Выберите типоразмер");
      return;
    }
    const sizeText = opt.textContent.trim();
    filterFn = (item) => item["Типоразмер"] === sizeText;
  }

  else if (current === "Сельхоз шины") {
    url = "Готовые json/Сельхоз шины в json.json";
    const sizeEl = document.getElementById("size_agro");
    const opt = sizeEl.options[sizeEl.selectedIndex];
    if (!opt.value) {
      alert("Выберите типоразмер");
      return;
    }
    const sizeText = opt.textContent.trim();
    filterFn = (item) => item["Типоразмер"] === sizeText;
  }

  else if (current === "Диски") {
    url = "Готовые json/Диски в json.json";

    const radiusEl = document.getElementById("radius_disk");
    const holesEl = document.getElementById("holes_disk");
    const pcdEl = document.getElementById("pcd_disk");
    const etEl = document.getElementById("et_disk");
    const diaEl = document.getElementById("dia_disk");

    // Берём выбранные <option>
    const radiusOpt = radiusEl.options[radiusEl.selectedIndex];
    const holesOpt = holesEl.options[holesEl.selectedIndex];
    const pcdOpt = pcdEl.options[pcdEl.selectedIndex];
    const etOpt = etEl.options[etEl.selectedIndex];
    const diaOpt = diaEl.options[diaEl.selectedIndex];

    // Проверяем: выбраны ли ВСЕ
    if (!radiusOpt.value || !holesOpt.value || !pcdOpt.value || !etOpt.value || !diaOpt.value) {
      alert("Выберите радиус, кол-во отверстий, PCD, ET и DIA");
      return;
    }

    // Берём ТЕКСТ (как у грузовых!)
    const radiusText = radiusOpt.textContent.trim();
    const holesText = holesOpt.textContent.trim();
    const pcdText = pcdOpt.textContent.trim();
    const etText = etOpt.textContent.trim();
    const diaText = diaOpt.textContent.trim();

    filterFn = (item) =>
      item["Диаметр"] === radiusText &&
      item["Болт_количество"] === holesText &&
      item["PCD"] === pcdText &&
      item["ET"] === etText &&
      item["DIA"] === diaText;
  }

  // === Загружаем нужный файл ===
  if (!url) return;

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`Товары не загрузились`);
      return res.json();
    })
    .then(items => {
      const filtered = items.filter(filterFn);
      showResults(filtered, current);
    })
    .catch(err => {
      console.error(err);
      alert(`Ошибка на стороне сайта`);
    });
};

function showResults(items, type) {
  if (items.length === 0) {
    alert("В наличии нет");
    return;
  }

  resultsEl.style.display = "flex";
  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="model">${item["Модель"]}</div>
      <div class="stock">На складе: ${item["Остаток"]}</div>
      <div class="price">Цена: ${item["Цена"]} ₽</div>
      <img class="photo" src="${item["Фото"]}" alt="${item["Модель"]}">
      <button class="btn-plus">+</button>
      <button class="btn-minus">–</button>
    `;
    resultsEl.appendChild(card);
  });
}

// Запуск
updateView();