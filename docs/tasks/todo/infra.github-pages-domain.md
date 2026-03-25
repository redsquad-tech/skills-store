# Настройка custom domain для store.insightstream.ru

**ID:** infra.github-pages-domain  
**Complexity:** low  
**Priority:** high  
**Status:** todo

---

## Problem

**Текущее состояние (проверено через gh API):**

- ✅ GitHub Pages включён и работает
- ✅ Workflow деплоит успешно (status: built)
- ✅ CNAME файл создан: `store/public/CNAME` → `store.insightstream.ru`
- ✅ HTTPS enforced: включён
- ❌ Custom domain в GitHub Pages: **не настроен** (`cname: null` в API)
- ❌ DNS записи: **не настроены**

Сайт доступен только на https://redsquad-tech.github.io/skills-store/

Требуется настроить DNS у регистратора и убедиться что CNAME деплоится корректно.

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

**Готово:**
- ✅ GitHub Pages включён (source: gh-pages branch)
- ✅ Environment `github-pages` настроен
- ✅ Workflow `.github/workflows/deploy.yml` работает
- ✅ Деплой при push в main
- ✅ `store/public/CNAME` файл создан с `store.insightstream.ru`
- ✅ HTTPS enforced: true

**Осталось:**
- ⏳ Custom domain в GitHub Pages UI (API показывает `cname: null`)
- ⏳ DNS записи у регистратора
- ⏳ Проверка что CNAME копируется в `out/CNAME` при билде

**Текущий URL:** https://redsquad-tech.github.io/skills-store/

**Команды для проверки:**
```bash
# Проверить GitHub Pages статус
gh api repos/redsquad-tech/skills-store/pages

# Проверить CNAME в репозитории
gh api repos/redsquad-tech/skills-store/contents/store/public/CNAME

# Проверить DNS
dig store.insightstream.ru A
```

**Ссылки:**
- [GitHub Pages custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [DNS records for GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain)
