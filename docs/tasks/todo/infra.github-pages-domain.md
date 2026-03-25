# Настройка custom domain для store.insightstream.ru

**ID:** infra.github-pages-domain  
**Complexity:** low  
**Priority:** high  
**Status:** todo

---

## Problem

GitHub Pages настроен и деплой работает. Сайт доступен на https://redsquad-tech.github.io/skills-store/

Требуется настроить custom domain store.insightstream.ru через GitHub UI и DNS.

---

## Scope

### In
- Настройка custom domain в GitHub Pages settings
- Настройка DNS записей у регистратора домена
- Проверка HTTPS сертификата

### Out
- Изменения в коде
- Изменения в workflow

---

## Requirements

### 1. Настроить Custom Domain в GitHub

В GitHub repository settings:

1. Перейти в **Settings → Pages**
2. В разделе **Custom domain**:
   - Ввести: `store.insightstream.ru`
   - Нажать **Save**
3. После проверки DNS поставить галочку **Enforce HTTPS**

> ⚠️ **Важно:** Не менять Source — уже настроен GitHub Actions

### 2. DNS настройки

У регистратора домена insightstream.ru добавить DNS записи:

| Тип | Имя | Значение | TTL |
|-----|-----|----------|-----|
| A   | store | 185.199.108.153 | 3600 |
| A   | store | 185.199.109.153 | 3600 |
| A   | store | 185.199.110.153 | 3600 |
| A   | store | 185.199.111.153 | 3600 |

---

## Acceptance Criteria

- [ ] Custom domain `store.insightstream.ru` указан в GitHub Pages settings
- [ ] DNS записи настроены у регистратора
- [ ] Сайт доступен по https://store.insightstream.ru
- [ ] HTTPS сертификат активен

---

## Implementation Notes

**Автоматически настроено (через gh CLI):**
- ✅ GitHub Pages включён
- ✅ Environment github-pages настроен (protected branches)
- ✅ Workflow `.github/workflows/deploy.yml` работает
- ✅ Деплой при push в main
- ✅ `store/public/CNAME` файл создан

**Текущий URL:** https://redsquad-tech.github.io/skills-store/

**Ссылки:**
- [GitHub Pages custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
