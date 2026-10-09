const DEFAULT_FALLBACK = {
    "clan": {
        "name": "Olo'Kafu'áng",
        "tagline": "Мы — те, кто слышит Эйву",
        "description": "Клан Olo'Kafu'áng объединяет сильнейших воинов...",
        "socials": { "tiktok": "#", "telegram": "#", "discord": "#", "youtube": "#" }
    },
    "sessions": [],
    "members": [],
    "ranks": ["Лидер", "Старейшина", "Воин", "Охотник", "Целитель", "Ученик", "Новобранец"],
    "rules": ["Уважай Эйву и братьев по клану."]
};

const StorageManager = {
    async init() {
        if (!localStorage.getItem(CONFIG.storageKey)) {
            try {
                // Пытаемся загрузить из JSON
                const response = await fetch('./data/default-data.json');
                if (!response.ok) throw new Error("JSON not found");
                const data = await response.json();
                this.save(data);
            } catch (e) {
                console.warn("Fetch failed (maybe file:// protocol). Using fallback data.", e);
                this.save(DEFAULT_FALLBACK);
            }
        }
    },
    get() {
        return JSON.parse(localStorage.getItem(CONFIG.storageKey)) || DEFAULT_FALLBACK;
    },
    save(data) {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
    },
    reset() {
        localStorage.removeItem(CONFIG.storageKey);
        location.reload();
    }
};

// Инициализация при загрузке скрипта
StorageManager.init();