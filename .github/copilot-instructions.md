# Copilot Instructions for blureen-vue

## Project Overview

Vue 3 admin template (Vuexy-based) with Vuetify 3, RTL/Persian support, CASL authorization, and AG-Grid Enterprise. Uses file-based routing and auto-imports.

## Architecture

### Key Path Aliases

- `@/` → `src/`, `@core/` → `src/@core/`, `@layouts/` → `src/@layouts/`
- `@images/` → `src/assets/images/`, `@styles/` → `src/assets/styles/`
- `@themeConfig` → `themeConfig.js`

### Plugin System

Plugins in `src/plugins/` auto-register via `@core/utils/plugins.js`. Numeric prefixes control load order (e.g., `1.router/`, `2.pinia.js`, `3.ag-grid/`).

### Routing & Pages

- File-based routing: `src/pages/` maps to routes via `unplugin-vue-router`
- Use `definePage()` macro for route meta (layout, permissions):

```js
definePage({
  meta: {
    layout: 'blank', // 'default' | 'blank'
    unauthenticatedOnly: true, // login pages only
    action: 'read', // CASL action
    subject: 'User-Details', // CASL subject
  },
})
```

### API Layer

- **`$api`** (`src/utils/api.js`): `ofetch`-based, for mutations
- **`useApi`** (`src/composables/useApi.js`): `@vueuse/core` createFetch, for reactive queries
- Both auto-inject `Authorization` header from `accessToken` cookie, redirect to login on 401

### Authentication & Authorization

- Cookies: `accessToken`, `userData`, `userAbilityRules` via `useCookie()` composable
- CASL abilities from `userAbilityRules` cookie, checked in route guards (`src/plugins/1.router/guards.js`)
- Navigation items filtered by `action`/`subject` in `src/navigation/vertical/`

## Component Patterns

### Auto-Imports

Components from `src/@core/components/`, `src/components/`, and `src/views/demos/` auto-register. Composables from `src/composables/`, `src/@core/composable/`, `src/@core/utils/` auto-import.

### AG-Grid Usage

```vue
<AgGridVue :theme="theme" :columnDefs="columnDefs" :rowData="rowData" />
```

- Get theme via `const { theme } = useAGGridTheme()`
- Persian locale and Shabnam font applied globally
- Custom cell renderers registered in `src/plugins/3.ag-grid/`

### Date Handling

Use `moment-jalaali` (auto-imported as `moment`):

```js
moment(value, 'jYYYY-jMM-jDD').format('jYYYY/jMM/jD')
```

### I18n

Locales in `src/plugins/i18n/locales/`. Default locale is `fa` (Persian/RTL).

## Navigation Structure

Define nav items in `src/navigation/vertical/` with CASL permissions:

```js
export default [
  {
    title: 'Users',
    to: 'apps-user-list',
    icon: { icon: 'tabler-users' },
    action: 'read',
    subject: 'User-Details',
  },
]
```

## Commands

```bash
pnpm dev       # Start dev server
pnpm build     # Production build
pnpm lint      # ESLint fix
```

## Environment

Required `.env`:

```
VITE_API_BASE_URL="your/api/address/api"
```
