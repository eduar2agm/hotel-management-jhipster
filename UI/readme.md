# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Consuming Backend Endpoints

This project uses `axios` configured in `src/api/axios-instance.ts` as `apiClient`.

Services live in `src/services` and provide simple CRUD functions. Example usage:

```ts
import { ReservaService } from './services';

// Get all reservas
const { data: reservas } = await ReservaService.getReservas({ sort: 'id,desc' });

// Create a new reserva
const newReserva = await ReservaService.createReserva({ fechaInicio: '2025-12-15T00:00:00Z', fechaFin: '2025-12-18T00:00:00Z', fechaReserva: new Date().toISOString(), estado: 'PENDIENTE', activo: true });
```

Use `useApiClient` hook to ensure the `Authorization` header is applied with the access token.

### Import pattern (naming)

All services are exported as *named exports* from `src/services` (barrel) and all API types are exported as *named exports* from `src/types/api` (barrel). This keeps imports consistent and clear.

Examples:

- Import a service from the barrel `src/services`:
```ts
import { ReservaService, ClienteService } from '../services';

// Usage
const { data: reservas } = await ReservaService.getReservas({ sort: 'id,desc' });
```

- Import a single service directly (not recommended — prefer barrel):
```ts
import { ReservaService } from '../services/reserva.service';
```

- Import types from the barrel `src/types/api`:
```ts
import type { ReservaDTO, ClienteDTO } from '../types/api';
```

- Example using hook `useApiClient` and a service:
```ts
import { ReservaService } from '../services';
import { useApiClient } from '../hooks/useApiClient';

const api = useApiClient(); // ensures token header set
const { data } = await ReservaService.getReservas();
```

Note: Prefer named exports for services to allow better tree-shaking and explicit imports.

