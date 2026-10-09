function checkPassword() {
    try {
        const input = document.getElementById("admin-password").value;
        
        // Надежная проверка пароля
        // ЗАМЕНИ "твой_пароль" НА СВОЙ РЕАЛЬНЫЙ ПАРОЛЬ!
        const realPassword = (typeof CONFIG !== 'undefined' && CONFIG.adminPassword) ? CONFIG.adminPassword : "твой_пароль";

        if (input === realPassword) {
            document.getElementById("login-screen").style.display = "none";
            const dashboard = document.getElementById("admin-dashboard");
            if (dashboard) dashboard.style.display = "block";
            loadAdminData();
        } else {
            const errorText = document.getElementById("login-error");
            if (errorText) errorText.style.display = "block";
        }
    } catch (error) {
        alert("Эйва сообщает об ошибке: " + error.message);
    }
}

// Переключение вкладок
function openTab(tabId) {
    document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));
    document.getElementById(tabId).classList.add("active");
    event.currentTarget.classList.add("active");
}

// Вспомогательная функция для безопасной загрузки
function safeSetValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value || "";
}

// Загрузка данных в формы
function loadAdminData() {
    const data = StorageManager.get();
    
    // Вкладка "Главная"
    safeSetValue("edit-clan-name", data.clan.name);
    safeSetValue("edit-clan-tagline", data.clan.tagline);
    safeSetValue("edit-clan-desc", data.clan.description);
    
    if (data.clan.socials) {
        safeSetValue("edit-social-discord", data.clan.socials.discord);
        safeSetValue("edit-social-telegram", data.clan.socials.telegram);
        safeSetValue("edit-social-tiktok", data.clan.socials.tiktok);
        safeSetValue("edit-social-youtube", data.clan.socials.youtube);
    }

    // Загрузка правил (каждое правило с новой строки)
    const rulesEl = document.getElementById("rules-input");
    if (rulesEl) {
        rulesEl.value = (data.rules && data.rules.length > 0) ? data.rules.join('\n') : "";
    }

    // Вкладка "Клан"
    renderMembersEditList(data);
}

// Сохранение вкладки "Главная"
function saveGeneral() {
    const data = StorageManager.get();
    
    const nameEl = document.getElementById("edit-clan-name");
    if (nameEl) data.clan.name = nameEl.value;

    const taglineEl = document.getElementById("edit-clan-tagline");
    if (taglineEl) data.clan.tagline = taglineEl.value;

    const descEl = document.getElementById("edit-clan-desc");
    if (descEl) data.clan.description = descEl.value;
    
    if (!data.clan.socials) data.clan.socials = {};
    
    const discordEl = document.getElementById("edit-social-discord");
    if (discordEl) data.clan.socials.discord = discordEl.value;
    
    const tgEl = document.getElementById("edit-social-telegram");
    if (tgEl) data.clan.socials.telegram = tgEl.value;
    
    const ttEl = document.getElementById("edit-social-tiktok");
    if (ttEl) data.clan.socials.tiktok = ttEl.value;
    
    const ytEl = document.getElementById("edit-social-youtube");
    if (ytEl) data.clan.socials.youtube = ytEl.value;

    // Сохранение правил
    const rulesEl = document.getElementById("rules-input");
    if (rulesEl) {
        data.rules = rulesEl.value.split('\n').map(rule => rule.trim()).filter(rule => rule !== "");
    }

    StorageManager.save(data);
    alert("Настройки успешно сохранены!");
    
    if (typeof renderHeaderInfo === "function") renderHeaderInfo();
    if (typeof renderRules === "function") renderRules();
}

// Рендер списка участников для редактирования
function renderMembersEditList(data) {
    const container = document.getElementById("members-edit-list");
    if (!container) return; // Защита от ошибки, если элемента нет
    container.innerHTML = "";
    
    if (!data.members) return;

    data.members.forEach((m, index) => {
        const div = document.createElement("div");
        div.className = "edit-item";
        
        let rankOptions = data.ranks.map(r => `<option value="${r}" ${m.rank === r ? 'selected' : ''}>${r}</option>`).join('');
        let statusOptions = `
            <option value="online" ${m.status === 'online' ? 'selected' : ''}>Онлайн</option>
            <option value="offline" ${m.status === 'offline' ? 'selected' : ''}>Офлайн</option>
            <option value="reserve" ${m.status === 'reserve' ? 'selected' : ''}>Резерв</option>
        `;

        div.innerHTML = `
            <input type="text" value="${m.avatar}" class="mem-avatar" style="max-width: 60px; text-align: center;" placeholder="Эмодзи">
            <input type="text" value="${m.name}" class="mem-name" placeholder="Имя воина">
            <select class="mem-rank">${rankOptions}</select>
            <select class="mem-status">${statusOptions}</select>
            <button class="btn btn-danger btn-small" onclick="removeMember(this)">Удалить</button>
        `;
        container.appendChild(div);
    });
}

function addNewMember() {
    const data = StorageManager.get();
    if (!data.members) data.members = [];
    data.members.push({ id: Date.now(), name: "Новый воин", rank: "Новобранец", status: "offline", joined: new Date().toISOString().split('T')[0], avatar: "👤" });
    renderMembersEditList(data);
}

function removeMember(btn) {
    btn.parentElement.remove();
}

function saveMembers() {
    const data = StorageManager.get();
    const newMembers = [];
    document.querySelectorAll(".edit-item").forEach((item, index) => {
        newMembers.push({
            id: index + 1,
            avatar: item.querySelector(".mem-avatar").value,
            name: item.querySelector(".mem-name").value,
            rank: item.querySelector(".mem-rank").value,
            status: item.querySelector(".mem-status").value,
            joined: new Date().toISOString().split('T')[0]
        });
    });
    data.members = newMembers;
    StorageManager.save(data);
    alert("Состав клана обновлен!");
}

// Экспорт / Импорт / Сброс JSON
function exportJSON() {
    const data = StorageManager.get();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "default-data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const json = JSON.parse(e.target.result);
            if (json.clan && json.members) {
                StorageManager.save(json);
                alert("Данные успешно импортированы! Страница будет перезагружена.");
                location.reload();
            } else {
                alert("Неверный формат файла данных.");
            }
        } catch (err) {
            alert("Ошибка чтения JSON.");
        }
    };
    reader.readAsText(file);
}

function resetData() {
    if (confirm("Вы уверены? Это удалит локальные изменения и загрузит стандартные данные (из default-data.json).")) {
        StorageManager.reset();
    }
}
