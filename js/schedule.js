document.addEventListener("DOMContentLoaded", () => {
    renderSessions();
});

function renderSessions() {
    const data = StorageManager.get();
    const container = document.getElementById("sessions-container");
    container.innerHTML = "";

    if (data.sessions.length === 0) {
        container.innerHTML = "<p style='text-align:center; grid-column: 1/-1;'>Древо Голосов молчит. Сессий пока нет.</p>";
        return;
    }

    data.sessions.forEach(session => {
        const isFull = session.taken >= session.slots;
        const isCompleted = session.status === "completed";
        const statusClass = session.status === "planned" ? "status-planned" : "status-completed";
        const statusText = session.status === "planned" ? "Запланировано" : "Завершено";

        const card = document.createElement("div");
        card.className = "session-card glow-box";
        
        card.innerHTML = `
            <div class="session-header">
                <div class="session-title font-orbitron">${session.title}</div>
                <div class="status-badge ${statusClass}">${statusText}</div>
            </div>
            <div class="session-info">
                <p><strong>Дата:</strong> ${session.date} | <strong>Время:</strong> ${session.time}</p>
                <p style="margin-top: 10px;">${session.description}</p>
            </div>
            <div class="session-slots">
                Записано воинов: <strong>${session.taken} / ${session.slots}</strong>
            </div>
            <button class="btn btn-primary glow-box join-btn" 
                onclick="joinSession(${session.id})" 
                ${isFull || isCompleted ? 'disabled' : ''}>
                ${isCompleted ? 'Охота окончена' : (isFull ? 'Мест нет' : 'Присоединиться')}
            </button>
        `;
        container.appendChild(card);
    });
}

function joinSession(id) {
    const data = StorageManager.get();
    const sessionIndex = data.sessions.findIndex(s => s.id === id);
    
    if (sessionIndex !== -1) {
        const session = data.sessions[sessionIndex];
        if (session.taken < session.slots) {
            const name = prompt("Назови свое имя, воин (для записи):");
            if (name && name.trim() !== "") {
                data.sessions[sessionIndex].taken++;
                StorageManager.save(data);
                renderSessions();
                alert(`Эйва видит тебя, ${name}. Ты записан!`);
            }
        }
    }
}