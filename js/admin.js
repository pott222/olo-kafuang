document.addEventListener("DOMContentLoaded", async () => {
    bindAdminEvents();
    try {
        await StorageManager.init();
        window.addEventListener("site-auth-change", event => {
            updateAdminAccess(event.detail).catch(error => {
                showStatus(`Не удалось обновить состояние входа: ${error.message}`, true);
            });
        });
        await updateAdminAccess(await StorageManager.currentUser());
    } catch (error) {
        showStatus(`Не удалось загрузить данные: ${error.message}`, true);
    }
});

function bindAdminEvents() {
    const loginForm = document.getElementById("login-screen");
    const dashboard = document.getElementById("admin-dashboard");

    loginForm.addEventListener("submit", event => {
        event.preventDefault();
        signInAdmin().catch(error => {
            showStatus(`Не удалось выполнить вход: ${error.message}`, true);
        });
    });

    dashboard.addEventListener("click", event => {
        const tabButton = event.target.closest("[data-tab]");
        if (tabButton) {
            openTab(tabButton.dataset.tab, tabButton);
            return;
        }

        const actionButton = event.target.closest("[data-action]");
        if (!actionButton) return;

        const actions = {
            "save-general": saveGeneral,
            "add-member": addNewMember,
            "save-members": saveMembers,
            "add-session": addNewSession,
            "save-sessions": saveSessions,
            export: exportJSON,
            "sign-out": signOut
        };
        const action = actions[actionButton.dataset.action];
        if (action) {
            Promise.resolve(action()).catch(error => {
                showStatus(`Операция не выполнена: ${error.message}`, true);
            });
        }

        if (actionButton.dataset.action === "remove-member") {
            actionButton.closest(".edit-item")?.remove();
        } else if (actionButton.dataset.action === "remove-session") {
            actionButton.closest(".edit-item")?.remove();
        }
    });

    document.getElementById("import-file").addEventListener("change", importJSON);
    document.getElementById("unprivileged-sign-out").addEventListener("click", () => {
        signOut().catch(error => showStatus(`Не удалось выйти: ${error.message}`, true));
    });
}

async function signInAdmin() {
    const email = document.getElementById("admin-email").value.trim();
    const password = document.getElementById("admin-password").value;
    const errorText = document.getElementById("login-error");
    errorText.hidden = true;
    try {
        const user = await StorageManager.signIn(email, password);
        document.getElementById("admin-password").value = "";
        await updateAdminAccess(user);
    } catch (error) {
        errorText.textContent = `Не удалось войти: ${error.message}`;
        errorText.hidden = false;
    }
}

async function updateAdminAccess(user) {
    const login = document.getElementById("login-screen");
    const dashboard = document.getElementById("admin-dashboard");
    const errorText = document.getElementById("login-error");
    const logoutButton = document.getElementById("unprivileged-sign-out");

    if (!user) {
        login.hidden = false;
        dashboard.hidden = true;
        logoutButton.hidden = true;
        return;
    }

    if (user.app_metadata?.role !== "admin") {
        login.hidden = false;
        dashboard.hidden = true;
        logoutButton.hidden = false;
        errorText.textContent = "У аккаунта нет прав администратора. Попроси владельца проекта назначить роль admin в app_metadata.";
        errorText.hidden = false;
        return;
    }

    errorText.hidden = true;
    logoutButton.hidden = true;
    login.hidden = true;
    dashboard.hidden = false;
    document.getElementById("admin-user").textContent = `Вошёл как ${user.email}`;
    loadAdminData();
}

async function signOut() {
    await StorageManager.signOut();
    document.getElementById("admin-password").value = "";
    document.getElementById("login-error").hidden = true;
    await updateAdminAccess(null);
}

function openTab(tabId, button) {
    const target = document.getElementById(tabId);
    if (!target) return;

    document.querySelectorAll(".tab-content").forEach(panel => {
        const active = panel === target;
        panel.hidden = !active;
        panel.classList.toggle("active", active);
    });
    document.querySelectorAll(".tab-btn").forEach(tab => {
        const active = tab === button;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", String(active));
    });
}

function safeSetValue(id, value) {
    const element = document.getElementById(id);
    if (element) element.value = value ?? "";
}

function loadAdminData() {
    const data = StorageManager.get();
    safeSetValue("edit-clan-name", data.clan.name);
    safeSetValue("edit-clan-tagline", data.clan.tagline);
    safeSetValue("edit-clan-desc", data.clan.description);
    safeSetValue("edit-social-discord", data.clan.socials.discord);
    safeSetValue("edit-social-telegram", data.clan.socials.telegram);
    safeSetValue("edit-social-tiktok", data.clan.socials.tiktok);
    safeSetValue("edit-social-youtube", data.clan.socials.youtube);
    safeSetValue("rules-input", data.rules.join("\n"));
    renderMembersEditList(data);
    renderSessionsEditList(data);
}

function showStatus(message, isError = false) {
    const status = document.getElementById("admin-status");
    if (!status) {
        console.error(message);
        return;
    }
    status.hidden = false;
    status.textContent = message;
    status.classList.toggle("error", isError);
}

async function saveGeneral() {
    try {
        const data = StorageManager.get();
        const name = document.getElementById("edit-clan-name").value.trim();
        if (!name) throw new Error("Укажи название клана.");

        const socials = {
            discord: document.getElementById("edit-social-discord").value.trim(),
            telegram: document.getElementById("edit-social-telegram").value.trim(),
            tiktok: document.getElementById("edit-social-tiktok").value.trim(),
            youtube: document.getElementById("edit-social-youtube").value.trim()
        };
        for (const [service, value] of Object.entries(socials)) {
            if (value && !isHttpUrl(value)) {
                throw new Error(`Для ${service} укажи ссылку, начинающуюся с http:// или https://.`);
            }
        }

        data.clan.name = name;
        data.clan.tagline = document.getElementById("edit-clan-tagline").value.trim();
        data.clan.description = document.getElementById("edit-clan-desc").value.trim();
        data.clan.socials = socials;
        data.rules = document.getElementById("rules-input").value
            .split(/\r?\n/)
            .map(rule => rule.trim())
            .filter(Boolean);

        await StorageManager.save(data);
        if (typeof renderHeaderInfo === "function") renderHeaderInfo();
        if (typeof renderRules === "function") renderRules();
        showStatus("Настройки клана и правила опубликованы.");
    } catch (error) {
        showStatus(`Не удалось сохранить настройки: ${error.message}`, true);
    }
}

function createField(labelText, className, value, type = "text") {
    const label = document.createElement("label");
    label.className = "editor-field";
    label.append(document.createTextNode(labelText));

    const input = document.createElement(type === "textarea" ? "textarea" : "input");
    if (type !== "textarea") input.type = type;
    input.className = className;
    input.value = value ?? "";
    label.appendChild(input);
    return label;
}

function createSelect(className, options, value) {
    const select = document.createElement("select");
    select.className = className;
    options.forEach(option => {
        const item = document.createElement("option");
        item.value = option.value;
        item.textContent = option.label;
        item.selected = option.value === value;
        select.appendChild(item);
    });
    return select;
}

function createRemoveButton(action, label) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-danger btn-small";
    button.dataset.action = action;
    button.textContent = label;
    return button;
}

function nextId(items) {
    const ids = new Set(items.map(item => String(item.id)));
    let id = Date.now();
    while (ids.has(String(id))) id++;
    return id;
}

function renderMembersEditList(data) {
    const container = document.getElementById("members-edit-list");
    container.replaceChildren();

    data.members.forEach(member => {
        const row = document.createElement("div");
        row.className = "edit-item member-edit-item";
        row.dataset.id = String(member.id ?? Date.now());
        row.dataset.joined = member.joined ?? "";
        row.append(
            createField("Аватар", "mem-avatar", member.avatar || "👤"),
            createField("Имя", "mem-name", member.name),
            createSelect("mem-rank", data.ranks.map(rank => ({ value: rank, label: rank })), member.rank),
            createSelect("mem-status", [
                { value: "online", label: "Онлайн" },
                { value: "offline", label: "Офлайн" },
                { value: "reserve", label: "Резерв" }
            ], member.status),
            createRemoveButton("remove-member", "Удалить")
        );
        container.appendChild(row);
    });
}

function addNewMember() {
    const data = StorageManager.get();
    data.members.push({
        id: nextId(data.members),
        name: "",
        rank: data.ranks[data.ranks.length - 1] || "Новобранец",
        status: "offline",
        joined: new Date().toISOString().slice(0, 10),
        avatar: "👤"
    });
    renderMembersEditList(data);
    document.querySelector("#members-edit-list .edit-item:last-child .mem-name").focus();
}

async function saveMembers() {
    try {
        const data = StorageManager.get();
        const rows = [...document.querySelectorAll("#members-edit-list .edit-item")];
        const members = rows.map((row, index) => {
            const name = row.querySelector(".mem-name").value.trim();
            if (!name) throw new Error(`Укажи имя участника №${index + 1}.`);
            return {
                id: row.dataset.id || Date.now() + index,
                avatar: row.querySelector(".mem-avatar").value.trim() || "👤",
                name,
                rank: row.querySelector(".mem-rank").value,
                status: row.querySelector(".mem-status").value,
                joined: row.dataset.joined || new Date().toISOString().slice(0, 10)
            };
        });
        data.members = members;
        await StorageManager.save(data);
        showStatus("Состав клана обновлён на сайте.");
    } catch (error) {
        showStatus(`Не удалось сохранить состав: ${error.message}`, true);
    }
}

function renderSessionsEditList(data) {
    const container = document.getElementById("sessions-edit-list");
    container.replaceChildren();

    data.sessions.forEach(session => {
        const row = document.createElement("div");
        row.className = "edit-item session-edit-item";
        row.dataset.id = String(session.id ?? Date.now());
        row.append(
            createField("Название", "session-title-input", session.title),
            createField("Дата", "session-date-input", session.date, "date"),
            createField("Время", "session-time-input", session.time, "time"),
            createField("Мест", "session-slots-input", session.slots, "number"),
            createField("Записано", "session-taken-input", session.taken, "number"),
            createSelect("session-status-input", [
                { value: "planned", label: "Запланирована" },
                { value: "completed", label: "Завершена" }
            ], session.status === "completed" ? "completed" : "planned"),
            createField("Описание", "session-description-input", session.description, "textarea"),
            createRemoveButton("remove-session", "Удалить")
        );
        row.querySelector(".session-slots-input").min = "1";
        row.querySelector(".session-taken-input").min = "0";
        container.appendChild(row);
    });
}

function addNewSession() {
    const data = StorageManager.get();
    data.sessions.push({
        id: nextId(data.sessions),
        title: "",
        date: new Date().toISOString().slice(0, 10),
        time: "20:00",
        description: "",
        slots: 10,
        taken: 0,
        status: "planned"
    });
    renderSessionsEditList(data);
    document.querySelector("#sessions-edit-list .edit-item:last-child .session-title-input").focus();
}

async function saveSessions() {
    try {
        const data = StorageManager.get();
        const rows = [...document.querySelectorAll("#sessions-edit-list .edit-item")];
        const sessions = rows.map((row, index) => {
            const title = row.querySelector(".session-title-input").value.trim();
            const date = row.querySelector(".session-date-input").value;
            const time = row.querySelector(".session-time-input").value;
            const slots = Number(row.querySelector(".session-slots-input").value);
            const taken = Number(row.querySelector(".session-taken-input").value);
            if (!title || !date || !time) {
                throw new Error(`Заполни название, дату и время сессии №${index + 1}.`);
            }
            if (!Number.isInteger(slots) || slots < 1 ||
                !Number.isInteger(taken) || taken < 0 || taken > slots) {
                throw new Error(`Проверь количество мест и записанных для сессии №${index + 1}.`);
            }
            return {
                id: row.dataset.id || Date.now() + index,
                title,
                date,
                time,
                description: row.querySelector(".session-description-input").value.trim(),
                slots,
                taken,
                status: row.querySelector(".session-status-input").value
            };
        });
        data.sessions = sessions;
        await StorageManager.save(data);
        showStatus("Сессии обновлены на сайте.");
    } catch (error) {
        showStatus(`Не удалось сохранить сессии: ${error.message}`, true);
    }
}

function isHttpUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
    } catch {
        return false;
    }
}

function exportJSON() {
    try {
        const data = StorageManager.get();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "default-data.json";
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showStatus("Резервная копия JSON скачана.");
    } catch (error) {
        showStatus(`Не удалось экспортировать данные: ${error.message}`, true);
    }
}

function importJSON(event) {
    const input = event.target;
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onerror = () => showStatus("Не удалось прочитать выбранный файл.", true);
    reader.onload = async () => {
        try {
            const data = normalizeData(JSON.parse(reader.result));
            await StorageManager.save(data);
            loadAdminData();
            if (typeof renderHeaderInfo === "function") renderHeaderInfo();
            if (typeof renderRules === "function") renderRules();
            showStatus("Данные импортированы и опубликованы.");
        } catch (error) {
            showStatus(`Импорт отменён: ${error.message}`, true);
        } finally {
            input.value = "";
        }
    };
    reader.readAsText(file);
}
