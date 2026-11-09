create table if not exists public.site_content (
    id smallint primary key check (id = 1),
    data jsonb not null check (jsonb_typeof(data) = 'object'),
    updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

revoke all on table public.site_content from public, anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on table public.site_content to anon, authenticated;
grant update on table public.site_content to authenticated;

drop policy if exists "Public can read site content" on public.site_content;
create policy "Public can read site content"
    on public.site_content
    for select
    to anon, authenticated
    using (true);

drop policy if exists "Site admins can update site content" on public.site_content;
create policy "Site admins can update site content"
    on public.site_content
    for update
    to authenticated
    using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
    with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

insert into public.site_content (id, data)
values (
    1,
    $site_data$
    {
      "clan": {
        "name": "Olo'Kafu'áng",
        "tagline": "Мы — те, кто слышит Эйву",
        "description": "Клан Olo'Kafu'áng объединяет сильнейших воинов и мудрейших целителей. Мы чтим законы природы и защищаем наши земли от небесных людей.",
        "socials": {
          "tiktok": "https://www.tiktok.com/@kafuang.clan?_r=1&_t=ZS-99vir686rYd",
          "telegram": "https://t.me/kafuangcclan",
          "discord": "https://discord.gg/EBB6htXjw",
          "youtube": ""
        }
      },
      "sessions": [
        {
          "id": 1,
          "title": "Ночная охота на танатора",
          "date": "2025-01-15",
          "time": "20:00",
          "description": "Сбор у Древа Голосов. Подготовка к вылазке в северные джунгли.",
          "slots": 10,
          "taken": 4,
          "status": "planned"
        },
        {
          "id": 2,
          "title": "Полет с икранами",
          "date": "2025-01-18",
          "time": "18:30",
          "description": "Тренировка воздушных маневров в Парящих Горах.",
          "slots": 15,
          "taken": 15,
          "status": "completed"
        }
      ],
      "members": [
        {
          "id": 1,
          "name": "Тсу'тей",
          "rank": "Лидер",
          "status": "online",
          "joined": "2024-01-01",
          "avatar": "🌿"
        },
        {
          "id": 2,
          "name": "Нейтири",
          "rank": "Воин",
          "status": "offline",
          "joined": "2024-02-15",
          "avatar": "🏹"
        }
      ],
      "ranks": ["Лидер", "Старейшина", "Воин", "Охотник", "Целитель", "Ученик", "Новобранец"],
      "rules": [
        "1. Уважай Эйву и братьев по клану.",
        "2. Никакого конфликта без причины.",
        "3. Посещение тренировок обязательно для Воинов и Охотников."
      ]
    }
    $site_data$::jsonb
)
on conflict (id) do nothing;
