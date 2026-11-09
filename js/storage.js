const DEFAULT_FALLBACK = {
    clan: {
        name: "Olo'Kafu'áng",
        tagline: "Мы — те, кто слышит Эйву",
        description: "Клан Olo'Kafu'áng объединяет сильнейших воинов и мудрейших целителей. Мы чтим законы природы и защищаем наши земли от небесных людей.",
        socials: { tiktok: "", telegram: "", discord: "", youtube: "" }
    },
    sessions: [],
    members: [],
    ranks: ["Лидер", "Старейшина", "Воин", "Охотник", "Целитель", "Ученик", "Новобранец"],
    rules: []
};

function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeData(data) {
    if (!isPlainObject(data) || !isPlainObject(data.clan)) {
        throw new Error("В данных отсутствует объект clan.");
    }

    const result = {
        ...data,
        clan: {
            ...DEFAULT_FALLBACK.clan,
            ...data.clan,
            socials: {
                ...DEFAULT_FALLBACK.clan.socials,
                ...(isPlainObject(data.clan.socials) ? data.clan.socials : {})
            }
        },
        sessions: data.sessions === undefined ? [] : data.sessions,
        members: data.members === undefined ? [] : data.members,
        ranks: data.ranks === undefined ? [...DEFAULT_FALLBACK.ranks] : data.ranks,
        rules: data.rules === undefined ? [] : data.rules
    };

    if (typeof result.clan.name !== "string" ||
        typeof result.clan.tagline !== "string" ||
        typeof result.clan.description !== "string") {
        throw new Error("Название, слоган и описание клана должны быть текстом.");
    }

    for (const key of ["sessions", "members", "ranks", "rules"]) {
        if (!Array.isArray(result[key])) {
            throw new Error(`Поле ${key} должно быть массивом.`);
        }
    }

    for (const [index, member] of result.members.entries()) {
        if (!isPlainObject(member) ||
            typeof member.name !== "string" ||
            typeof member.rank !== "string" ||
            typeof member.status !== "string") {
            throw new Error(`Некорректная запись участника №${index + 1}.`);
        }
    }

    for (const [index, session] of result.sessions.entries()) {
        if (!isPlainObject(session) ||
            typeof session.title !== "string" ||
            typeof session.date !== "string" ||
            typeof session.time !== "string" ||
            typeof session.description !== "string" ||
            !Number.isInteger(Number(session.slots)) ||
            !Number.isInteger(Number(session.taken))) {
            throw new Error(`Некорректная запись сессии №${index + 1}.`);
        }
    }

    if (!result.ranks.every(rank => typeof rank === "string") ||
        !result.rules.every(rule => typeof rule === "string")) {
        throw new Error("Ранги и правила должны содержать только текст.");
    }

    return result;
}

const StorageManager = {
    initPromise: null,

    init() {
        if (!this.initPromise) {
            this.initPromise = this.loadInitialData();
        }
        return this.initPromise;
    },

    async loadInitialData() {
        const saved = localStorage.getItem(CONFIG.storageKey);
        if (saved !== null) {
            try {
                const normalized = normalizeData(JSON.parse(saved));
                localStorage.setItem(CONFIG.storageKey, JSON.stringify(normalized));
                return;
            } catch (error) {
                throw new Error(`Не удалось прочитать сохранённые данные сайта: ${error.message}`);
            }
        }

        let data;
        try {
            const response = await fetch("./data/default-data.json");
            if (!response.ok) {
                throw new Error(`Сервер ответил ${response.status}`);
            }
            data = normalizeData(await response.json());
        } catch (error) {
            if (location.protocol !== "file:") {
                throw new Error(`Не удалось загрузить data/default-data.json: ${error.message}`);
            }
            console.warn("Файл данных недоступен при открытии через file://, используются встроенные данные.", error);
            data = JSON.parse(JSON.stringify(DEFAULT_FALLBACK));
        }

        this.save(data);
    },

    get() {
        const saved = localStorage.getItem(CONFIG.storageKey);
        return normalizeData(saved === null
            ? JSON.parse(JSON.stringify(DEFAULT_FALLBACK))
            : JSON.parse(saved));
    },

    save(data) {
        const normalized = normalizeData(data);
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(normalized));
        return normalized;
    },

    reset() {
        localStorage.removeItem(CONFIG.storageKey);
        location.reload();
    }
};
