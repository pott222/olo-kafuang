document.addEventListener("DOMContentLoaded", () => {
    initCustomCursor();
    renderHeaderInfo();
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
