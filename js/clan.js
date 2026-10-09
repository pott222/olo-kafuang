document.addEventListener("DOMContentLoaded", () => {
    renderClan();
});

function renderClan() {
    const data = StorageManager.get();
    const container = document.getElementById("members-container");
    const statTotal = document.querySelector("#stat-total span");
    const statOnline = document.querySelector("#stat-online span");

    container.innerHTML = "";
    
    let onlineCount = 0;

    // Сортировка: Лидеры сверху, новобранцы снизу
    const sortedMembers = data.members.sort((a, b) => {
        return data.ranks.indexOf(a.rank) - data.ranks.indexOf(b.rank);
    });

    sortedMembers.forEach(member => {
        if (member.status === "online") onlineCount++;

        const statusClass = member.status === "online" ? "status-online" : 
                            (member.status === "reserve" ? "status-reserve" : "status-offline");
        
        const statusText = member.status === "online" ? "Онлайн" : 
                           (member.status === "reserve" ? "В резерве" : "Офлайн");

        const card = document.createElement("div");
        card.className = "member-card glow-box";
        card.innerHTML = `
            <div class="member-avatar">${member.avatar || '👤'}</div>
            <div class="member-name font-cinzel">${member.name}</div>
            <div class="member-rank font-orbitron">${member.rank}</div>
            <div>
                <span class="status-dot ${statusClass}"></span>
                <span style="font-size: 0.9rem; color: #ccc">${statusText}</span>
            </div>
            <div class="member-joined">В клане с: ${member.joined}</div>
        `;
        container.appendChild(card);
    });

    statTotal.textContent = data.members.length;
    statOnline.textContent = onlineCount;
}