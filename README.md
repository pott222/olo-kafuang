# Olo'Kafu'áng — Clan Website

Статический сайт клана в стилистике вселенной Аватар (На'ви, Пандора).
Не требует базы данных и бэкенда, хранит состояние локально и может обновляться через JSON-файл.

## 📤 Как опубликовать на GitHub Pages (Инструкция)

### Шаг 1: Подготовка репозитория
1. Зарегистрируйся на [GitHub](https://github.com/).
2. Создай новый репозиторий (нажми **New** или `+` в правом верхнем углу).
3. Назови его, например, `olo-kafuang`. Выбери **Public** и не ставь галочку "Add a README file" (мы загрузим свой). Нажми **Create repository**.

### Шаг 2: Загрузка файлов
**Вариант А (через сайт GitHub — самый простой):**
1. В созданном репозитории нажми **"uploading an existing file"**.
2. Перетащи все файлы и папки проекта (index.html, папки css, js, assets, data) прямо в браузер.
3. Убедись, что структура папок сохранилась! (Файл `default-data.json` должен лежать внутри папки `data`).
4. Нажми **Commit changes**.

**Вариант Б (через Git консоль):**
```bash
git init
git add .
git commit -m "Первый релиз сайта клана"
git branch -M main
git remote add origin [https://github.com/ТВОЙ_НИК/olo-kafuang.git](https://github.com/ТВОЙ_НИК/olo-kafuang.git)
git push -u origin main