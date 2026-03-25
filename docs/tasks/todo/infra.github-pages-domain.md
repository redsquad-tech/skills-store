# Настройка custom domain для store.insightstream.ru

**ID:** infra.github-pages-domain  
**Complexity:** low  
**Priority:** high  
**Status:** todo

---

## Problem

CNAME файл создан, но домен не работает. Требуется настроить DNS и подтвердить домен в GitHub.

---

## Scope

### In
- DNS записи у регистратора
- Custom domain в GitHub Pages settings
- Проверка HTTPS

### Out
- Изменения в коде
- Изменения в workflow

---

## Requirements

### 1. DNS настройки

У регистратора домена insightstream.ru добавить:

| Тип | Имя | Значение | TTL |
|-----|-----|----------|-----|
| A | store | 185.199.108.153 | 3600 |
| A | store | 185.199.109.153 | 3600 |
| A | store | 185.199.110.153 | 3600 |
| A | store | 185.199.111.153 | 3600 |

### 2. GitHub Pages settings

1. Settings → Pages → Custom domain
2. Ввести: `store.insightstream.ru`
3. Save
4. Enforce HTTPS: ✓

---

## Acceptance Criteria

- [ ] DNS записи настроены
- [ ] Custom domain указан в GitHub Pages
- [ ] https://store.insightstream.ru открывается
- [ ] HTTPS сертификат активен
