document.addEventListener("DOMContentLoaded", () => {
    initCustomCursor();
    renderHeaderInfo();
    renderRules();      // Загружаем правила на страницу Инфо
    initBurgerMenu();   // Включаем кнопку мобильного меню
});

function initCustomCursor() {
    const cursor = document.createElement("div");
    cursor.classList.add("custom-cursor");
    document.body.appendChild(cursor);

    document.addEventListener("mousemove", (e) => {
        cursor.style.left = e.clientX + "px";
        cursor.style.top = e.clientY + "px";
    });

    document.querySelectorAll("a, button, .clickable").forEach(el => {
        el.addEventListener("mouseenter", () => cursor.classList.add("cursor-hover"));
        el.addEventListener("mouseleave", () => cursor.classList.remove("cursor-hover"));
    });
}

function renderHeaderInfo() {
    const data = StorageManager.get();
    const nameEls = document.querySelectorAll(".clan-name-text");
    const taglineEls = document.querySelectorAll(".clan-tagline-text");
    const descEls = document.querySelectorAll(".clan-desc-text");

    nameEls.forEach(el => el.textContent = data.clan.name);
    taglineEls.forEach(el => el.textContent = data.clan.tagline);
    descEls.forEach(el => el.textContent = data.clan.description);

    // Установка ссылок на соцсети
    const socials = data.clan.socials;
    Object.keys(socials).forEach(key => {
        const linkEl = document.getElementById(`link-${key}`);
        if(linkEl) {
            linkEl.href = socials[key] || "#";
            if(!socials[key]) linkEl.style.display = "none";
        }
    });
}

// --- НОВАЯ ФУНКЦИЯ: Вывод правил клана ---
function renderRules() {
    const data = StorageManager.get();
    const rulesContainer = document.getElementById('rules-container');

    // Проверяем, есть ли контейнер на текущей странице и есть ли правила в базе
    if (rulesContainer && data.rules && data.rules.length > 0) {
        rulesContainer.innerHTML = ''; // Очищаем дефолтный текст-заглушку
        
        data.rules.forEach(rule => {
            if (rule.trim() !== "") {
                let li = document.createElement('li');
                li.textContent = rule;
                rulesContainer.appendChild(li);
            }
        });
    }
}

// --- НОВАЯ ФУНКЦИЯ: Мобильное меню (бургер) ---
function initBurgerMenu() {
    const burger = document.querySelector('.burger'); 
    const nav = document.querySelector('.nav-links');

    if (burger && nav) {
        burger.addEventListener('click', () => {
            nav.classList.toggle('active');
            burger.classList.toggle('active');
        });
    }
}
