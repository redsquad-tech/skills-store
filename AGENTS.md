# Insightstream - Skill Store

Статический каталог проверенных skills для AI-агентов.

**URL:** https://redsquad-tech.github.io/skills-store/  
**Домен:** store.insightstream.ru (требует настройки DNS)

---

## Архитектура

```
.
├── skills/                    # Skills с метаданными
│   └── <slug>/
│       ├── SKILL.md           # Документация скилла
│       └── metadata.yml       # Метаданные (каталог, лицензия, review)
├── store/                     # Next.js приложение
│   ├── app/                   # App Router страницы
│   ├── components/            # React компоненты
│   ├── lib/                   # Утилиты и генератор каталога
│   ├── public/data/           # Сгенерированные JSON индексы
│   ├── tests/                 # Тесты
│   │   ├── e2e/               # BDD E2E тесты (Cucumber + Playwright)
│   │   └── *.test.tsx         # Unit тесты (Vitest)
│   └── out/                   # Статический экспорт (build)
└── docs/tasks/                # Issues-as-Code
    ├── todo/                  # Активные задачи
    └── done/                  # Завершённые задачи
```

---

## Принципы разработки

### 1. TDD (Test-Driven Development)

**Цикл: Red → Green → Refactor**

1. **RED** — Пишем failing тест на новую функциональность
2. **GREEN** — Пишем минимальный код для прохождения теста
3. **REFACTOR** — Улучшаем код, сохраняя тесты зелёными

**Пример:**
```bash
# 1. Пишем тест (падает)
npm run test:e2e

# 2. Добавляем функциональность
# ... код ...

# 3. Запускаем снова (проходит)
npm run test:e2e
```

### 2. BDD (Behavior-Driven Development)

Используем **Cucumber.js** с Gherkin сценариями для E2E тестов.

**Структура сценария:**
```gherkin
Feature: Название функции

  Scenario: Пользовательская история
    Given начальное состояние
    When действие пользователя
    Then ожидаемый результат
```

**Файлы:**
- `store/tests/e2e/features/*.feature` — Gherkin сценарии
- `store/tests/e2e/step-definitions/*.js` — Step definitions
- `store/tests/e2e/hooks.js` — Хуки (Before/After)
- `store/tests/e2e/browser.js` — Playwright браузер

---

## Команды разработки

### Установка зависимостей

```bash
cd store
npm install
```

### Запуск dev сервера

```bash
npm run dev
# Next.js на localhost:3000 + Vitest watch
```

### Запуск тестов

**Unit тесты (Vitest):**
```bash
npm run test          # Один запуск
npm run test:watch    # Watch режим
npm run test:coverage # С покрытием
```

**E2E тесты (Cucumber + Playwright):**
```bash
npm run test:e2e
# Автоматически:
# 1. npm run generate (создать JSON индексы)
# 2. next build (собрать статический сайт)
# 3. serve out -l 3001 (запустить сервер на порту 3001)
# 4. cucumber-js (запустить BDD тесты)
# 5. Остановить сервер
```

**Важно:** `test:e2e` использует порт **3001**, не конфликтует с dev (3000)

### Линтинг

```bash
npm run lint          # Проверка ESLint
npm run lint:fix      # Авто-исправление
npm run lint:deps     # Проверка unused зависимостей (depcheck)
```

### Сборка

```bash
npm run build
# Выполняет:
# 1. npm run generate (JSON индексы из skills/)
# 2. npm run lint (ESLint проверка)
# 3. npm run lint:deps (depcheck проверка)
# 4. npm run test (Vitest unit тесты)
# 5. npm run test:e2e (Cucumber E2E тесты)
# 6. next build (статический экспорт в out/)
```

**Билд падает если:**
- ESLint нашёл ошибки
- Есть unused зависимости
- Unit тесты упали
- E2E тесты упали

---

## Добавление skills

1. Создать папку `skills/<slug>/`
2. Добавить `SKILL.md` и `metadata.yml`
3. Запустить `npm run build` для проверки
4. Закоммитить изменения

**Пример metadata.yml:**
```yaml
source:
  repo: "https://github.com/example/repo"
  url: "https://github.com/example/repo/tree/main/skills/<slug>"
  imported_at: "2026-03-25"

catalog:
  slug: "<slug>"
  title: "Название"
  tags:
    - "tag1"
    - "tag2"
  search_aliases:
    - "синоним1"
    - "синоним2"

skill:
  name: "<slug>"
  description: "Краткое описание"

review:
  status: "not-reviewed"  # reviewed, basic-tested, limitations, outdated
  summary: ""
  reviewed_at: ""

license:
  id: "Apache-2.0"
  url: "https://www.apache.org/licenses/LICENSE-2.0"
```

---

## BDD: Написание новых сценариев

### 1. Создать .feature файл

`store/tests/e2e/features/<name>.feature`:
```gherkin
Feature: Название функции

  @e2e
  Scenario: Пользовательская история
    Given я нахожусь на странице
    When я делаю действие
    Then вижу результат
```

### 2. Добавить step definitions

`store/tests/e2e/step-definitions/<name>.js`:
```javascript
const { Given, When, Then } = require('@cucumber/cucumber')

Given('я нахожусь на странице', async function() {
  await this.getPage().goto('/')
})

When('я делаю действие', async function() {
  await this.getPage().getByRole('button').click()
})

Then('вижу результат', async function() {
  await this.getPage().getByText('результат').waitFor({ state: 'visible' })
})
```

### 3. Запустить тест

```bash
npm run test:e2e
```

---

## CI/CD

**GitHub Actions:** `.github/workflows/deploy.yml`

1. Checkout репозитория
2. Setup Node.js 20
3. Install dependencies
4. Build (генерация + линт + тесты + экспорт)
5. Upload artifact в GitHub Pages

**Деплой:** Автоматически при push в `main`

---

## Переменные окружения

| Переменная | Описание | Пример |
|------------|----------|--------|
| `TEST_BASE_URL` | URL для E2E тестов | `http://localhost:3001` |
| `SITE_BASE_PATH` | Base path для GitHub Pages | `/skills-store` |

---

## Структура тестов

```
store/tests/
├── e2e/
│   ├── browser.js              # Playwright инициализация
│   ├── hooks.js                # Before/After хуки
│   ├── features/
│   │   └── install-skill.feature  # Gherkin сценарий
│   └── step-definitions/
│       └── install-skill.steps.js # Step definitions
└── *.test.tsx                  # Unit тесты
```

---

## Решение проблем

### Тесты не находят элементы

Проверить selector в DevTools:
```javascript
await page.getByRole('button', { name: 'текст' }).click()
```

### Билд падает на линте

```bash
npm run lint:fix  # Авто-исправление
```

### E2E тесты таймаутятся

Увеличить таймаут в step definition:
```javascript
Then('шаг', async function() {
  await this.getPage().waitForTimeout(1000)
  // ...
}, { timeout: 10000 })
```

### Конфликт портов

- Dev сервер: порт 3000
- E2E тесты: порт 3001

---

## Ссылки

- [Next.js документация](https://nextjs.org/docs)
- [Cucumber.js документация](https://cucumber.io/docs/javascript/)
- [Playwright документация](https://playwright.dev/)
- [Vitest документация](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
