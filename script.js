// уведомление
let toastTimeout = null;

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.display = "block";

  // Очищаем старый таймер, если он есть
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  // Ставим новый таймер
  toastTimeout = setTimeout(() => {
    toast.style.display = "none";
    toastTimeout = null; // сбрасываем
  }, 1000);
}


// Количество товаров в корзине
function getCartCountText() {
  const total = cart.reduce((sum, entry) => sum + entry.count, 0);
  let word = "товар";
  if (total % 10 === 1 && total % 100 !== 11) {
    word = "товар";
  } else if ([2,3,4].includes(total % 10) && ![12,13,14].includes(total % 100)) {
    word = "товара";
  } else {
    word = "товаров";
  }
  return `${total} ${word} в корзине`;
}


// Берём все ссылки в шапке
const scrollButtons = document.querySelectorAll('[data-scroll-to]');

scrollButtons.forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.preventDefault();

    const targetId = this.getAttribute('data-scroll-to');
    const targetSection = document.getElementById(targetId);

    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

const items = ["Легковые шины", "Грузовые шины", "Сельхоз шины", "Диски"];
let index = 0;

const currentEl = document.getElementById("current");

// Блоки фильтров
const filtersSize = document.getElementById("filters_size_passenger_cars");
const filtersTruck = document.getElementById("filters_truck");
const filtersAgro = document.getElementById("filters_agro");
const filtersWheel = document.getElementById("filters_wheel");

// Кнопка
const submitBtn = document.getElementById("submit");

// Скрываем все фильтры
function hideAll() {
  filtersSize.style.display = "none";
  filtersTruck.style.display = "none";
  filtersAgro.style.display = "none";
  filtersWheel.style.display = "none";
}

function updateView() {
  hideAll();

  if (items[index] === "Легковые шины") {
    filtersSize.style.display = "block";
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








// === Корзина ===
let cart = []; // [{ item, count }]

const cartIcon = document.getElementById("cart-icon");
const cartToggle = document.getElementById("cart-toggle");
const cartPopup = document.getElementById("cart-popup");
const overlay = document.getElementById("overlay");
const cartItemsEl = document.getElementById("cart-items");
const totalPriceEl = document.getElementById("total-price");
const checkoutBtn = document.getElementById("checkout");

// Обновить иконку корзины
function updateCartIcon() {
  if (cart.length === 0) {
    cartIcon.src = "корзина-пустая.png";
  } else {
    cartIcon.src = "корзина-полная.png";
  }
}

// Показать/скрыть попап
cartToggle.addEventListener("click", (e) => {
  e.preventDefault();
  overlay.style.display = "block";
  cartPopup.style.display = "block";
  renderCart();
});

overlay.addEventListener("click", () => {
  overlay.style.display = "none";
  cartPopup.style.display = "none";
});

// Удалить товар из корзины
function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
  updateCartIcon();
}

// Изменить количество товара
function changeCount(index, delta) {
  cart[index].count += delta;
  if (cart[index].count <= 0) {
    removeFromCart(index);
  } else {
    saveCart();
    renderCart();
  }
}

// Сохраняем корзину в памяти (можно потом в localStorage)
function saveCart() {
  // пока просто держим в переменной
}

// Рендер корзины в попапе
function renderCart() {
  cartItemsEl.innerHTML = "";
  let total = 0;

  cart.forEach((entry, i) => {
    const { item, count } = entry;
    const price = parseInt(item["Цена"]) || 0;
    const lineTotal = price * count;
    total += lineTotal;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item["Фото"]}" alt="${item["Модель"]}">
      <div>
        <div class="model">${item["Модель"]}</div>
        <div class="price">${count} шт × ${price} ₽ = ${lineTotal} ₽</div>
      </div>
      <button class="remove-btn">×</button>
    `;
    div.querySelector(".remove-btn").onclick = () => removeFromCart(i);
    cartItemsEl.appendChild(div);
  });

  totalPriceEl.textContent = total;
}

// === Добавление товаров из карточек ===

// Ловим клики по + и - ВЕЗДЕ на странице (включая попап, но там их нет)
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-plus")) {
    const card = e.target.closest(".product-card");
    if (!card) return;

    const model = card.querySelector(".model").textContent;
    const stockText = card.querySelector(".stock").textContent;
    const priceText = card.querySelector(".price").textContent;
    const photo = card.querySelector(".photo").src;

    const stockMatch = stockText.match(/(\d+)/);
    const maxStock = stockMatch ? parseInt(stockMatch[1]) : 0;
    const price = parseInt(priceText.replace(/\D/g, "")) || 0;

    const existing = cart.find(entry => entry.item["Модель"] === model);
    const currentCount = existing ? existing.count : 0;

    if (currentCount >= maxStock) {
      showToast("Это всё, что есть в наличии");
      return;
    }

    if (existing) {
      existing.count++;
    } else {
      cart.push({ item: { "Модель": model, "Цена": price, "Фото": photo, "Максимум": maxStock }, count: 1 });
    }

    showToast(getCartCountText()); // ← вот так!
    updateCartIcon();
  }

  if (e.target.classList.contains("btn-minus")) {
    const card = e.target.closest(".product-card");
    if (!card) return;

    const model = card.querySelector(".model").textContent;
    const existingIndex = cart.findIndex(entry => entry.item["Модель"] === model);

    if (existingIndex !== -1) {
      cart[existingIndex].count--;
      showToast(getCartCountText()); // ← и тут!

      if (cart[existingIndex].count <= 0) {
        cart.splice(existingIndex, 1);
      }

      updateCartIcon();
    }
  }
});

// Кнопка "К оформлению"
checkoutBtn.addEventListener("click", () => {
  alert("Переход к оформлению (пока заглушка)");
  // Здесь можно сделать переход на другую страницу или форму
});

// Инициализация
updateCartIcon();
// Запуск
updateView();