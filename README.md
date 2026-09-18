# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## SALIK Authentication

The app uses one username/password login for every role. The API verifies credentials against the SQLite database at `data/salik.sqlite`, creates a server-side session token, and returns the user's role and school context.

Run both the API and Vite frontend with:

```bash
npm run dev
```

Fixed demo accounts (all passwords are `123456`):

| Username | Role | School |
| --- | --- | --- |
| `student01` | `student` | `mySchool` |
| `parent01` | `parent` | `mySchool` |
| `schooladmin01` | `school_admin` | `mySchool` |
| `authority01` | `authority` | Global authority |

Authentication endpoints:

- `POST /api/auth/login`
- `GET /api/auth/session`
- `POST /api/auth/forgot-password` (demo recovery flow)
