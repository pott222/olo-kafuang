document.addEventListener("DOMContentLoaded", async () => {
    try {
        await StorageManager.init();
        renderSessions();
    } catch (error) {
        showAppError(error);
    }
});

function renderSessions() {
    const container = document.getElementById("sessions-container");
    if (!container) return;

    const data = StorageManager.get();
    const sessions = data.sessions;
    container.replaceChildren();

    if (sessions.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.style.cssText = "text-align:center;grid-column:1/-1";
        emptyMessage.textContent = "Древо Голосов молчит. Сессий пока нет.";
        container.appendChild(emptyMessage);
        return;
    }

    sessions.forEach(session => {
        const isCompleted = session.status === "completed";
        const slots = Number(session.slots);
        const taken = Number(session.taken);
        const isFull = taken >= slots;
        const card = document.createElement("article");
        card.className = "session-card glow-box";

        const header = document.createElement("div");
        header.className = "session-header";
        const title = document.createElement("div");
        title.className = "session-title font-orbitron";
        title.textContent = session.title;
        const badge = document.createElement("div");
        badge.className = `status-badge ${isCompleted ? "status-completed" : "status-planned"}`;
        badge.textContent = isCompleted ? "Завершено" : "Запланировано";
        header.append(title, badge);

        const info = document.createElement("div");
        info.className = "session-info";
        const dateLine = document.createElement("p");
        dateLine.textContent = `Дата: ${session.date} | Время: ${session.time}`;
        const description = document.createElement("p");
        description.style.marginTop = "10px";
        description.textContent = session.description;
        info.append(dateLine, description);

        const slotsInfo = document.createElement("div");
        slotsInfo.className = "session-slots";
        slotsInfo.append("Записано воинов: ");
        const count = document.createElement("strong");
        count.textContent = `${taken} / ${slots}`;
        slotsInfo.appendChild(count);

        const discordUrl = data.clan.socials.discord;
        const button = document.createElement(isCompleted || isFull || !isHttpUrl(discordUrl) ? "button" : "a");
        button.className = "btn btn-primary glow-box join-btn";
        if (isCompleted || isFull || !isHttpUrl(discordUrl)) {
            button.type = "button";
            button.disabled = true;
            button.textContent = isCompleted ? "Охота окончена" : isFull ? "Мест нет" : "Связь Discord не настроена";
        } else {
            button.href = discordUrl;
            button.target = "_blank";
            button.rel = "noopener noreferrer";
            button.textContent = "Записаться в Discord";
        }

        card.append(header, info, slotsInfo, button);
        container.appendChild(card);
    });
}

function isHttpUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
    } catch {
        return false;
    }
}
