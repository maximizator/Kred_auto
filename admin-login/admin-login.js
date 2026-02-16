// 🔥 Ключевая строка: удаляем текущую страницу из истории
history.replaceState(null, '', location.href);

function login() {
    const l = document.getElementById('login').value;
    const p = document.getElementById('password').value;
    if (l === "admin" && p === "12345") { // ← замени на безопасную проверку
    sessionStorage.setItem('auth', 'true');
    window.location.replace('../admin-panel/admin-panel.html');
    } else {
    alert("Неверный логин или пароль");
    }
}