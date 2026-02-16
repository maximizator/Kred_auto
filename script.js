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




// === Берём все ссылки в шапке ===
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




// Логика загрузки данных
function loadCategoryData(category) {
  let urls = [];
  if (category === "Легковые шины") {
    urls = ["data/passenger.json", "data/data_Легковые_шины.json"];
  } else if (category === "Грузовые шины") {
    urls = ["data/truck.json", "data/data_Грузовые_шины.json"];
  } else if (category === "Сельхоз шины") {
    urls = ["data/agro.json", "data/data_Сельхоз_шины.json"];
  } else if (category === "Диски") {
    urls = ["data/wheels.json", "data/data_Диски.json"];
  } else {
    return;
  }

  Promise.all(urls.map(url => 
    fetch(url).then(res => {
      if (!res.ok) throw new Error(`Ошибка загрузки ${url}`);
      return res.json();
    })
  ))
  .then(dataArrays => {
    // Объединяем все массивы в один
    const allData = dataArrays.flat();
    populateFilters(allData, category);
  })
  .catch(err => {
    console.error(err);
    showToast("Не удалось загрузить каталог");
  });
}




// === Динамическое обнавление <option> ===
function populateFilters(data, type) {
  if (type === "Легковые шины") {
    const sizes = [...new Set(data.map(i => i["Типоразмер"]))].sort();
    const sel = document.getElementById("width");
    sel.innerHTML = '<option value="">Типоразмер</option>';
    sizes.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      sel.appendChild(opt);
    });
  }

  else if (type === "Грузовые шины") {
    const sizes = [...new Set(data.map(i => i["Типоразмер"]))].sort();
    const sel = document.getElementById("size_truck");
    sel.innerHTML = '<option value="">Типоразмер</option>';
    sizes.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      sel.appendChild(opt);
    });
  }

  else if (type === "Сельхоз шины") {
    const sizes = [...new Set(data.map(i => i["Типоразмер"]))].sort();
    const sel = document.getElementById("size_agro");
    sel.innerHTML = '<option value="">Типоразмер</option>';
    sizes.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      sel.appendChild(opt);
    });
  }

  else if (type === "Диски") {
    const fields = [
      { key: "Диаметр", el: "radius_disk", label: "Радиус" },
      { key: "Болт_количество", el: "holes_disk", label: "Кол-во отверстий" },
      { key: "PCD", el: "pcd_disk", label: "PCD" },
      { key: "ET", el: "et_disk", label: "ET" },
      { key: "DIA", el: "dia_disk", label: "DIA" }
    ];

    fields.forEach(f => {
      const values = [...new Set(data.map(i => i[f.key]))].filter(v => v && v !== "0.00").sort();
      const sel = document.getElementById(f.el);
      sel.innerHTML = `<option value="">${f.label}</option>`;
      values.forEach(v => {
        const opt = document.createElement("option");
        opt.value = v;
        opt.textContent = v;
        sel.appendChild(opt);
      });
    });
  }
}




// === Слайдер ===
const items = ["Легковые шины", "Грузовые шины", "Сельхоз шины", "Диски"];
let index = 0;

const currentEl = document.getElementById("current");

const filtersSize = document.getElementById("filters_size_passenger_cars");
const filtersTruck = document.getElementById("filters_truck");
const filtersAgro = document.getElementById("filters_agro");
const filtersWheel = document.getElementById("filters_wheel");

const submitBtn = document.getElementById("submit");

function hideAll() {
  filtersSize.style.display = "none";
  filtersTruck.style.display = "none";
  filtersAgro.style.display = "none";
  filtersWheel.style.display = "none";
}

function updateView() {
  hideAll();

  const currentCategory = items[index];

  if (currentCategory === "Легковые шины") {
    filtersSize.style.display = "block";
  } else if (currentCategory === "Грузовые шины") {
    filtersTruck.style.display = "block";
  } else if (currentCategory === "Сельхоз шины") {
    filtersAgro.style.display = "block";
  } else if (currentCategory === "Диски") {
    filtersWheel.style.display = "block";
  }

  loadCategoryData(currentCategory);
}

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

const resultsEl = document.getElementById("results");

document.getElementById("submit").onclick = () => {
  resultsEl.innerHTML = "";
  resultsEl.style.display = "none";

  const current = document.getElementById("current").textContent;

  let urls = [];
  let filterFn = () => true;

  if (current === "Легковые шины") {
    urls = ["data/passenger.json", "data/data_Легковые_шины.json"];

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
    urls = ["data/truck.json", "data/data_Грузовые_шины.json"];
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
    urls = ["data/agro.json", "data/data_Сельхоз_шины.json"];
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
    urls = ["data/wheels.json", "data/data_Диски.json"];

    const radiusEl = document.getElementById("radius_disk");
    const holesEl = document.getElementById("holes_disk");
    const pcdEl = document.getElementById("pcd_disk");
    const etEl = document.getElementById("et_disk");
    const diaEl = document.getElementById("dia_disk");

    const radiusOpt = radiusEl.options[radiusEl.selectedIndex];
    const holesOpt = holesEl.options[holesEl.selectedIndex];
    const pcdOpt = pcdEl.options[pcdEl.selectedIndex];
    const etOpt = etEl.options[etEl.selectedIndex];
    const diaOpt = diaEl.options[diaEl.selectedIndex];

    if (!radiusOpt.value || !holesOpt.value || !pcdOpt.value || !etOpt.value || !diaOpt.value) {
      alert("Выберите радиус, кол-во отверстий, PCD, ET и DIA");
      return;
    }

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

  if (urls.length === 0) return;

  Promise.all(
    urls.map(url =>
      fetch(url).then(res => {
        if (!res.ok) throw new Error(`Товары не загрузились: ${url}`);
        return res.json();
      })
    )
  )
    .then(dataArrays => {
      const allItems = dataArrays.flat();
      const filtered = allItems.filter(filterFn);
      showResults(filtered, current);
    })
    .catch(err => {
      console.error(err);
      alert("Ошибка на стороне сайта");
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
    
    // Логика для картинки: если есть Фото, берем его, иначе заглушку
    const imgSrc = item["Фото"] ? item["Фото"] : "data/placeholder.png";
    const imgAlt = item["Модель"] || "Товар";

    card.innerHTML = `
      <div class="model">${item["Модель"]}</div>
      <div class="stock">На складе: ${item["Остаток"]}</div>
      <div class="price">Цена: ${item["Цена"]} ₽</div>
      <img class="photo" src="${imgSrc}" alt="${imgAlt}">
      <div class="counter">
        <span class="count">0</span>
        <button class="btn-plus">+</button>
        <button class="btn-minus">–</button>
      </div>
    `;
    resultsEl.appendChild(card);
  });
}




// === Корзина ===
let cart = [];

const cartIcon = document.getElementById("cart-icon");
const cartToggle = document.getElementById("cart-toggle");
const cartPopup = document.getElementById("cart-popup");
const overlay = document.getElementById("overlay");
const cartItemsEl = document.getElementById("cart-items");
const totalPriceEl = document.getElementById("total-price");
const checkoutBtn = document.getElementById("checkout");

function updateCartIcon() {
  if (cart.length === 0) {
    cartIcon.src = "cart-empty.png";
  } else {
    cartIcon.src = "cart-full.png";
  }
}

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

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
  updateCartIcon();
  updateAllCounters();
}

function changeCount(index, delta) {
  cart[index].count += delta;
  if (cart[index].count <= 0) {
    removeFromCart(index);
  } else {
    saveCart();
    renderCart();
    updateAllCounters();
  }
}

// Сохраняем корзину в памяти (можно потом в localStorage)
function saveCart() {
  // пока просто держим в переменной
}

function renderCart() {
  cartItemsEl.innerHTML = "";
  let total = 0;

  cart.forEach((entry, i) => {
    const { item, count } = entry;
    const price = parseInt(item["Цена"]) || 0;
    const lineTotal = price * count;
    total += lineTotal;

    // Та же логика для корзины
    const imgSrc = item["Фото"] ? item["Фото"] : "data/placeholder.png";
    const imgAlt = item["Модель"] || "Товар";

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${imgSrc}" alt="${imgAlt}">
      <div>
        <div class="model">${item["Модель"]}</div>
        <div class="price">${count} шт × ${price} ₽ = ${lineTotal} ₽</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;">
        <button class="cart-plus">+</button>
        <button class="cart-minus">–</button>
      </div>
      <button class="remove-btn">×</button>
    `;
    div.querySelector(".remove-btn").onclick = () => removeFromCart(i);
    cartItemsEl.appendChild(div);
  });

  totalPriceEl.textContent = total;
}

document.addEventListener("click", (e) => {
  // === В карточках товаров (каталог) ===
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
      cart.push({
        item: {
          "Модель": model,
          "Цена": price,
          "Фото": photo,
          "Максимум": maxStock
        },
        count: 1
      });
    }

    updateCartIcon();
    updateAllCounters();
  }

  if (e.target.classList.contains("btn-minus")) {
    const card = e.target.closest(".product-card");
    if (!card) return;

    const model = card.querySelector(".model").textContent;
    const existingIndex = cart.findIndex(entry => entry.item["Модель"] === model);

    if (existingIndex !== -1 && cart[existingIndex].count > 0) {
      cart[existingIndex].count--;
      
      if (cart[existingIndex].count === 0) {
        cart.splice(existingIndex, 1);
      }

      updateCartIcon();
      updateAllCounters();
    }
  }

  // === В корзине (попап) ===
  if (e.target.classList.contains("cart-plus")) {
    const itemEl = e.target.closest(".cart-item");
    if (!itemEl) return;

    const model = itemEl.querySelector(".model").textContent;
    const entry = cart.find(item => item.item["Модель"] === model);
    if (!entry) return;

    if (entry.count >= entry.item["Максимум"]) {
      showToast("Это всё, что есть в наличии");
      return;
    }

    entry.count++;
    saveCart();
    renderCart();
    updateAllCounters();
  }

  if (e.target.classList.contains("cart-minus")) {
    const itemEl = e.target.closest(".cart-item");
    if (!itemEl) return;

    const model = itemEl.querySelector(".model").textContent;
    const index = cart.findIndex(item => item.item["Модель"] === model);
    if (index === -1) return;

    cart[index].count--;
    if (cart[index].count <= 0) {
      cart.splice(index, 1);
    }

    saveCart();
    renderCart();
    updateCartIcon();
    updateAllCounters();
  }
});

checkoutBtn.addEventListener("click", () => {
  alert("Переход к оформлению");
});

function updateAllCounters() {
  document.querySelectorAll(".product-card").forEach(card => {
    const model = card.querySelector(".model").textContent;
    const countEl = card.querySelector(".count");
    const entry = cart.find(e => e.item["Модель"] === model);
    countEl.textContent = entry ? entry.count : 0;
  });
}

// Инициализация
updateCartIcon();
// Запуск
updateView();