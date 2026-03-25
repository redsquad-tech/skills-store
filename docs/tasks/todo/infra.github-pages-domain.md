# Настройка GitHub Pages для store.insightstream.ru

**ID:** infra.github-pages-domain  
**Complexity:** low  
**Priority:** high  
**Status:** todo

---

## Problem

Для публикации сайта на кастомном домене store.insightstream.ru требуется ручная настройка в GitHub и DNS.

---

## Scope

### In
- Настройка GitHub Pages в settings репозитория
- Настройка DNS записей у регистратора домена
- Проверка HTTPS сертификата

### Out
- Изменения в коде
- Изменения в workflow

---

## Requirements

### 1. GitHub Pages Settings

В GitHub repository settings:

1. Перейти в **Settings → Pages**
2. В разделе **Build and deployment**:
   - Source: **GitHub Actions** (не "Deploy from a branch")
3. В разделе **Custom domain**:
   - Ввести: `store.insightstream.ru`
   - Нажать **Save**
   - Поставить галочку **Enforce HTTPS** (появится после проверки DNS)

### 2. DNS настройки

У регистратора домена insightstream.ru добавить DNS записи:

| Тип | Имя | Значение | TTL |
|-----|-----|----------|-----|
| A   | store | 185.199.108.153 | 3600 |
| A   | store | 185.199.109.153 | 3600 |
| A   | store | 185.199.110.153 | 3600 |
| A   | store | 185.199.111.153 | 3600 |

**Или CNAME (альтернатива):**

| Тип | Имя | Значение | TTL |
|-----|-----|----------|-----|
| CNAME | store | redsquad-tech.github.io | 3600 |

**Рекомендуется использовать A записи** для лучшей производительности.

### 3. Проверка

После настройки:

1. Подождать propagation DNS (до 24 часов, обычно 5-30 минут)
2. Проверить доступность: `https://store.insightstream.ru`
3. Убедиться, что HTTPS работает
4. Проверить, что workflow деплоя запускается при push в main

---

## Acceptance Criteria

- [ ] В Settings → Pages выбран источник "GitHub Actions"
- [ ] В Settings → Pages указан custom domain `store.insightstream.ru`
- [ ] DNS записи настроены у регистратора
- [ ] Сайт доступен по https://store.insightstream.ru
- [ ] HTTPS сертификат активен
- [ ] Workflow деплоя работает при push в main

---

## Implementation Notes

**Созданные файлы:**
- `.github/workflows/deploy.yml` — workflow для деплоя
- `store/public/CNAME` — файл с доменным именем для GitHub Pages
- `store/next.config.mjs` — обновлён с `basePath: ''`

**Порядок выполнения:**
1. Выполнить эту задачу (настроить DNS и GitHub Pages)
2. Сделать push в main — запустится деплой
3. Проверить доступность сайта

**Ссылки:**
- [GitHub Pages custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [GitHub Pages IP addresses](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-a-subdomain)
