document.addEventListener("DOMContentLoaded", async () => {
    try {
        await StorageManager.init();
        renderClan();
    } catch (error) {
        showAppError(error);
    }
});

function renderClan() {
    const data = StorageManager.get();
    const container = document.getElementById("members-container");
    const statTotal = document.querySelector("#stat-total span");
    const statOnline = document.querySelector("#stat-online span");
    if (!container || !statTotal || !statOnline) return;

    container.replaceChildren();
    let onlineCount = 0;
    const rankOrder = new Map(data.ranks.map((rank, index) => [rank, index]));
    const sortedMembers = [...data.members].sort((a, b) =>
        (rankOrder.get(a.rank) ?? Number.MAX_SAFE_INTEGER) -
        (rankOrder.get(b.rank) ?? Number.MAX_SAFE_INTEGER)
    );

    sortedMembers.forEach(member => {
        if (member.status === "online") onlineCount++;

        const statusClass = member.status === "online" ? "status-online"
            : member.status === "reserve" ? "status-reserve" : "status-offline";
        const statusText = member.status === "online" ? "Онлайн"
            : member.status === "reserve" ? "В резерве" : "Офлайн";

        const card = document.createElement("article");
        card.className = "member-card glow-box";

        const avatar = document.createElement("div");
        avatar.className = "member-avatar";
        avatar.textContent = member.avatar || "👤";

        const name = document.createElement("div");
        name.className = "member-name font-cinzel";
        name.textContent = member.name;

        const rank = document.createElement("div");
        rank.className = "member-rank font-orbitron";
        rank.textContent = member.rank;

        const status = document.createElement("div");
        const dot = document.createElement("span");
        dot.className = `status-dot ${statusClass}`;
        dot.setAttribute("aria-hidden", "true");
        const label = document.createElement("span");
        label.style.cssText = "font-size:.9rem;color:#ccc";
        label.textContent = statusText;
        status.append(dot, label);

        const joined = document.createElement("div");
        joined.className = "member-joined";
        joined.textContent = member.joined ? `В клане с: ${member.joined}` : "";

        card.append(avatar, name, rank, status, joined);
        container.appendChild(card);
    });

    statTotal.textContent = String(data.members.length);
    statOnline.textContent = String(onlineCount);
}
