# Kinopoisk API Project

SPA-приложение на `React + Vite + TypeScript` для просмотра фильмов через Kinopoisk API.

В проекте есть:
- список фильмов
- страница фильма
- добавление в избранное
- отдельная страница избранного
- подтверждение добавления в избранное через кастомное модальное окно
- фильтрация списка
- сравнение фильмов
- бесконечная прокрутка

## Stack

- `React`
- `TypeScript`
- `Vite`
- `React Router`
- `TanStack Query`
- `Redux Toolkit`
- `React Redux`
- `CSS Modules`

## Запуск проекта

1. Установить зависимости:

```bash
npm install
```

2. Создать локальный env-файл на основе шаблона:

```bash
cp .env.default .env
```

3. Указать API-ключ Kinopoisk в `.env`

4. Запустить проект:

```bash
npm run dev
```

## Доступные команды

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Переменные окружения

Используется переменная:

```env
VITE_API_KEY=your_kinopoisk_api_key
```

Важно:
- переменные с префиксом `VITE_` доступны во фронтенде
- не коммить реальный ключ в публичный репозиторий

## Структура

```text
src/
  features/
    movies/
    favourites/
    navbar/
  hooks/
  redux/
```

## Сборка

Production-сборка:

```bash
npm run build
```
