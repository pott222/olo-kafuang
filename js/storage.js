const DEFAULT_FALLBACK = {
    clan: {
        name: "Olo'Kafu'áng",
        tagline: "Мы — те, кто слышит Эйву",
        description: "",
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

function backendErrorMessage(error) {
    if (error?.code === "PGRST116") {
        return "В Supabase не найдены начальные данные. Выполни SQL-файл supabase/setup.sql в SQL Editor.";
    }
    if (error?.code === "42P01" || error?.code === "PGRST205") {
        return "Таблица сайта не найдена. Выполни SQL-файл supabase/setup.sql в SQL Editor.";
    }
    return error?.message || "Неизвестная ошибка Supabase.";
}

const StorageManager = {
    client: null,
    data: null,
    initPromise: null,
    backendConfigured: false,

    init() {
        if (!this.initPromise) {
            this.initPromise = this.connect();
        }
        return this.initPromise;
    },

    async connect() {
        const hasProjectUrl = Boolean(CONFIG.supabaseUrl && !CONFIG.supabaseUrl.includes("YOUR_PROJECT_ID"));
        const hasPublishableKey = Boolean(CONFIG.supabaseAnonKey && !CONFIG.supabaseAnonKey.includes("YOUR_SUPABASE"));

        if (!hasProjectUrl && !hasPublishableKey) {
            const response = await fetch("./data/default-data.json");
            if (!response.ok) {
                throw new Error(`Не удалось загрузить data/default-data.json: сервер ответил ${response.status}.`);
            }
            this.data = normalizeData(await response.json());
            return;
        }
        if (!hasProjectUrl || !hasPublishableKey) {
            throw new Error("В js/config.js должны быть заполнены и Supabase Project URL, и Publishable key.");
        }
        if (!window.supabase?.createClient) {
            throw new Error("Не загрузилась библиотека Supabase. Проверь подключение к интернету и обнови страницу.");
        }

        this.backendConfigured = true;
        this.client = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey);
        await this.reload();

        this.client.auth.onAuthStateChange((_event, session) => {
            window.dispatchEvent(new CustomEvent("site-auth-change", { detail: session?.user ?? null }));
        });
    },

    async reload() {
        const { data, error } = await this.client
            .from("site_content")
            .select("data")
            .eq("id", 1)
            .single();

        if (error) {
            throw new Error(backendErrorMessage(error));
        }
        this.data = normalizeData(data.data);
    },

    get() {
        if (!this.data) {
            throw new Error("Данные сайта ещё не загружены.");
        }
        return JSON.parse(JSON.stringify(this.data));
    },

    async save(data) {
        const normalized = normalizeData(data);
        const { data: saved, error } = await this.client
            .from("site_content")
            .update({ data: normalized, updated_at: new Date().toISOString() })
            .eq("id", 1)
            .select("data")
            .single();

        if (error) {
            if (error.code === "PGRST116" || error.code === "42501") {
                throw new Error("Supabase отклонил изменение. Проверь, что у аккаунта в app_metadata установлено role = admin, затем выйди и войди снова.");
            }
            throw new Error(backendErrorMessage(error));
        }
        this.data = normalizeData(saved.data);
        return this.get();
    },

    async signIn(email, password) {
        const { data, error } = await this.client.auth.signInWithPassword({ email, password });
        if (error) {
            throw new Error(error.message);
        }
        return data.user;
    },

    async currentUser() {
        const { data, error } = await this.client.auth.getUser();
        if (error) {
            if (error.name === "AuthSessionMissingError") return null;
            throw new Error(error.message);
        }
        return data.user;
    },

    async signOut() {
        const { error } = await this.client.auth.signOut();
        if (error) throw new Error(error.message);
    }
};
