document.addEventListener("DOMContentLoaded", async () => {
    try {
        await StorageManager.init();
        initCustomCursor();
        renderHeaderInfo();
        renderRules();
        initBurgerMenu();
    } catch (error) {
        showAppError(error);
    }
});

function showAppError(error) {
    console.error(error);
    if (document.getElementById("app-error")) return;
    const notice = document.createElement("p");
    notice.id = "app-error";
    notice.setAttribute("role", "alert");
    notice.textContent = `Не удалось загрузить данные сайта. Проверь настройки Supabase и права доступа к таблице site_content. Подробности: ${error.message}`;
    notice.style.cssText = "position:relative;z-index:10000;margin:1rem;padding:1rem;background:#3a1111;color:#fff;border:1px solid #ff6b6b;border-radius:8px";
    document.body.prepend(notice);
}

function initCustomCursor() {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const cursor = document.createElement("div");
    cursor.classList.add("custom-cursor");
    document.body.appendChild(cursor);

    document.addEventListener("mousemove", event => {
        cursor.style.left = `${event.clientX}px`;
        cursor.style.top = `${event.clientY}px`;
    });

    document.querySelectorAll("a, button, .clickable").forEach(element => {
        element.addEventListener("mouseenter", () => cursor.classList.add("cursor-hover"));
        element.addEventListener("mouseleave", () => cursor.classList.remove("cursor-hover"));
    });
}

function renderHeaderInfo() {
    const data = StorageManager.get();
    document.querySelectorAll(".clan-name-text").forEach(element => {
        element.textContent = data.clan.name;
    });
    document.querySelectorAll(".clan-tagline-text").forEach(element => {
        element.textContent = data.clan.tagline;
    });
    document.querySelectorAll(".clan-desc-text").forEach(element => {
        element.textContent = data.clan.description;
    });

    for (const [key, value] of Object.entries(data.clan.socials)) {
        const link = document.getElementById(`link-${key}`);
        if (!link) continue;

        const url = typeof value === "string" ? value.trim() : "";
        let validUrl = false;
        try {
            const parsedUrl = new URL(url);
            validUrl = parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:";
        } catch {
            validUrl = false;
        }

        link.hidden = !validUrl;
        if (validUrl) {
            link.href = url;
            link.rel = "noopener noreferrer";
        } else {
            link.removeAttribute("href");
        }
    }
}

function renderRules() {
    const rulesContainer = document.getElementById("rules-container");
    if (!rulesContainer) return;

    const rules = StorageManager.get().rules;
    rulesContainer.replaceChildren();

    if (rules.length === 0) {
        const item = document.createElement("li");
        item.textContent = "Правила пока не добавлены.";
        rulesContainer.appendChild(item);
        return;
    }

    rules.forEach(rule => {
        const item = document.createElement("li");
        item.textContent = rule;
        rulesContainer.appendChild(item);
    });
}

function initBurgerMenu() {
    const burger = document.querySelector(".burger-menu, .burger");
    const nav = document.querySelector(".nav-links");
    if (!burger || !nav) return;

    burger.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("active");
        burger.setAttribute("aria-expanded", String(isOpen));
    });
}
