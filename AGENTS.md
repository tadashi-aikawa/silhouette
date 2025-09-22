# Repository Guidelines

## Project Structure & Modules
- `src/` TypeScript/Svelte sources
  - `app/` services, orchestration (e.g., `TimerServiceImpl.ts`)
  - `repository/` data access abstractions/impls
  - `domain/` domain value objects
  - `ui/` view models and helpers
  - `component/` Svelte components (e.g., `RepetitionTaskView.svelte`)
  - `utils/` pure utilities with tests
- Root assets: `main.js`, `styles.css`, `manifest*.json`
- Config: `esbuild.config.mts`, `tsconfig.json`, `jest.config.js`, `.prettierrc`

## Build, Test, Dev
- Install: `bun install`
- Dev (watch + copy to Obsidian vault): `bun run dev`
  - Update `VAULT_DIR` in `esbuild.config.mts` to your local vault path.
- Build (typecheck + bundle): `bun run build`
- Test (Jest): `bun run test`
- CI (install + build + test): `bun run ci`

## Coding Style & Naming
- Language: TypeScript (strict), Svelte 4; CommonJS bundle target `es2018`.
- Formatting: Prettier with `prettier-plugin-svelte` and organize-imports. Run your editor’s Prettier on save.
- Indentation: 2 spaces; EOL: LF (`.editorconfig`).
- Filenames: `camelCase` for modules (`timerService.ts`), `PascalCase` for classes and Svelte components, `kebab-case` for assets.
- Keep functions small and pure in `utils/`; side effects from `app/` or `repository/` layers.

## Testing Guidelines
- Framework: Jest via `esbuild-jest` transform.
- Location: colocate as `*.test.ts` next to sources (see `src/utils/*.test.ts`).
- Scope: fast, unit-level tests for utils/services; avoid Obsidian runtime in unit tests.
- Run: `bun run test`. Add cases for edge dates/offset rules.

## Commit & PR Guidelines
- Conventional Commits; examples:
  - `feat: add repetition range parser`
  - `fix: handle non workday offset`
  - `style: format Svelte components`
- PRs: clear description, link issues, include screenshots/GIFs for UI changes (put under `resources/`), note manual test steps. Keep changes focused.
- Releases are automated via semantic‑release on `master` (no `v` prefix tags).

## Security & Configuration
- Never commit personal vault paths. Keep only the placeholder constant in `esbuild.config.mts`.
- Do not include vault data in tests or repo. 
- Target Bun ≥ 1.1; Node types are used for tooling only.

## 言語ポリシー
- このリポジトリに関する会話・レビューコメント・ドキュメントの説明は日本語で行う。
- Conventional Commits の type は英語（feat, fix など）を使用し、本文は日本語で記述してよい。
