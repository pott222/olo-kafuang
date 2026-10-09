// Авторизация
function checkPassword() {
    const input = document.getElementById("admin-password").value;
    if (input === CONFIG.adminPassword) {
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("admin-dashboard").style.display = "block";
        loadAdminData();
    } else {
        document.getElementById("login-error").style.display = "block";
    }
}

// Переключение вкладок
function openTab(tabId) {
    document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));
    document.getElementById(tabId).classList.add("active");
    event.currentTarget.classList.add("active");
}

// Загрузка данных в формы
function loadAdminData() {
    const data = StorageManager.get();
    
    // Вкладка "Главная"
    document.getElementById("edit-clan-name").value = data.clan.name;
    document.getElementById("edit-clan-tagline").value = data.clan.tagline;
    document.getElementById("edit-clan-desc").value = data.clan.description;
    
    document.getElementById("edit-social-discord").value = data.clan.socials.discord;
    document.getElementById("edit-social-telegram").value = data.clan.socials.telegram;
    document.getElementById("edit-social-tiktok").value = data.clan.socials.tiktok;
    document.getElementById("edit-social-youtube").value = data.clan.socials.youtube;

    // Вкладка "Клан"
    renderMembersEditList(data);
}

// Сохранение вкладки "Главная"
function saveGeneral() {
    const data = StorageManager.get();
    data.clan.name = document.getElementById("edit-clan-name").value;
    data.clan.tagline = document.getElementById("edit-clan-tagline").value;
    data.clan.description = document.getElementById("edit-clan-desc").value;
    
    data.clan.socials.discord = document.getElementById("edit-social-discord").value;
    data.clan.socials.telegram = document.getElementById("edit-social-telegram").value;
    data.clan.socials.tiktok = document.getElementById("edit-social-tiktok").value;
    data.clan.socials.youtube = document.getElementById("edit-social-youtube").value;

    StorageManager.save(data);
    alert("Настройки успешно сохранены!");
    renderHeaderInfo(); // Обновляем шапку на лету
}

// Рендер списка участников для редактирования
function renderMembersEditList(data) {
    const container = document.getElementById("members-edit-list");
    container.innerHTML = "";
    
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
            joined: new Date().toISOString().split('T')[0] // Оставляем текущую или можно добавить поле даты
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