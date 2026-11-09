# Olo'Kafu'áng — сайт клана

Статический сайт на GitHub Pages с Supabase Auth для входа в админку и Supabase Postgres для общих данных сайта.

## Подключение Supabase

1. Создай проект на [supabase.com](https://supabase.com/) и дождись его запуска.
2. Открой в Supabase **SQL Editor**, вставь содержимое [`supabase/setup.sql`](supabase/setup.sql) и выполни. Скрипт создаёт таблицу с начальными данными и включает RLS: посетители могут читать данные сайта, изменять их могут только администраторы.
3. В **Authentication → Sign In / Providers → Email** отключи **Allow new users to sign up**, затем в **Authentication → Users** добавь пользователя с твоей почтой и надёжным паролем.
4. В SQL Editor выдай своему пользователю роль администратора, заменив адрес:

   ```sql
   update auth.users
   set raw_app_meta_data =
       coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
   where email = 'you@example.com';
   ```

   Проверь, что изменена ровно одна строка. После назначения роли выйди из аккаунта и войди заново, чтобы обновился токен.
5. Открой **Project Settings → API**. Скопируй Project URL и **publishable key** (или legacy `anon` key) в `js/config.js`:

   ```js
   const CONFIG = {
       supabaseUrl: "https://YOUR_PROJECT_ID.supabase.co",
       supabaseAnonKey: "YOUR_SUPABASE_PUBLISHABLE_KEY"
   };
   ```

   Publishable/anon key предназначен для браузера. **Никогда не добавляй `service_role` или secret key в этот файл** — они обходят защиту RLS.
6. Отправь изменения в GitHub. Открой сайт, затем `admin.html`, и войди почтой и паролем созданного пользователя.

## Работа сайта и безопасность

- Все страницы читают общие данные из Supabase. Правила RLS в базе разрешают запись только аккаунтам с `app_metadata.role = "admin"`.
- Админка умеет обновлять настройки, правила, состав, сессии, а также импортировать и экспортировать JSON.
- Запись на сессии ведёт в Discord; счётчик мест меняет администратор. Публичные посетители не получают права изменять данные сайта.
- Данные Supabase не являются секретными: содержимое сайта открыто для чтения. RLS защищает именно запись. Для входа используй уникальный пароль и не включай открытую регистрацию.
- Не храни секреты или приватные данные в публичной таблице.

## Локальный запуск

После заполнения Supabase URL и publishable key запусти локальный HTTP-сервер из папки проекта:

```bash
python -m http.server 8000
```

Открой <http://localhost:8000>. При запуске через `file://` загрузка модулей и запросы Supabase могут блокироваться браузером.
