# Productionization Migration Guide

A self-directed checklist for migrating this app from Create React App + JavaScript to Vite + TypeScript.

Complete Phase 1 fully and verify the deploy before starting Phase 2.

---

## Phase 1 — CRA → Vite

### 1.1 Swap build tooling

- [ ] Run `npm uninstall react-scripts`
- [ ] Run `npm install --save-dev vite @vitejs/plugin-react`
- [ ] Create `vite.config.js` in the project root:
  ```js
  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'

  export default defineConfig({
    plugins: [react()],
    base: '/Shiba-Pomodoro-Timer/',
  })
  ```
  > `base` is required so asset paths work on the GitHub Pages subfolder URL.

### 1.2 Relocate and update `index.html`

- [ ] Move `public/index.html` to the **project root** (Vite serves it from there, not from `public/`)
- [ ] Remove all `%PUBLIC_URL%` occurrences (Vite doesn't use that CRA placeholder)
- [ ] Replace the existing `<script>` tag (if any) with:
  ```html
  <script type="module" src="/src/index.js"></script>
  ```
- [ ] `shiba.png`, `manifest.json`, and other files in `public/` can stay — Vite copies them automatically

### 1.3 Update `package.json` scripts

- [ ] Replace the `scripts` block with:
  ```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
  ```
- [ ] Remove the `"test"` and `"eject"` scripts (no longer applicable)
- [ ] Remove the `"eslintConfig"` block (move to a separate `.eslintrc.cjs` later if you want linting)
- [ ] Remove the `"browserslist"` block (Vite uses its own targets via `vite.config.js`)

### 1.4 Verify locally

- [ ] Run `npm run dev` — app should open at `http://localhost:5173`
- [ ] Check that the shiba background image loads (tests asset handling)
- [ ] Check that the timer and task list work correctly
- [ ] Run `npm run build` — should produce a `dist/` folder (not `build/`)
- [ ] Run `npm run preview` — should serve the production build locally

### 1.5 Update GitHub Actions workflow

- [ ] Open `.github/workflows/deploy-pages.yml`
- [ ] Find the `actions/upload-pages-artifact` step and change the path from `build` to `dist`:
  ```yaml
  - uses: actions/upload-pages-artifact@v3
    with:
      path: dist
  ```

### 1.6 Deploy and verify

- [ ] Commit all changes: `git add . && git commit -m "chore: migrate from CRA to Vite"`
- [ ] Push to main: `git push origin main`
- [ ] Watch the Actions tab on GitHub — both `build` and `deploy` jobs should pass
- [ ] Visit `https://niknesladek.github.io/Shiba-Pomodoro-Timer/` and confirm the app works

---

## Phase 2 — JavaScript → TypeScript

Start this only after Phase 1 is fully working and deployed.

### 2.1 Install TypeScript and type packages

- [ ] Run `npm install --save-dev typescript @types/react @types/react-dom`
- [ ] Note: `react-circular-progressbar` v2 ships its own types — no extra `@types` package needed

### 2.2 Create `tsconfig.json` in the project root

- [ ] Create the file with these contents:
  ```json
  {
    "compilerOptions": {
      "target": "ES2020",
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "module": "ESNext",
      "moduleResolution": "bundler",
      "jsx": "react-jsx",
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noEmit": true,
      "skipLibCheck": true
    },
    "include": ["src"]
  }
  ```
  > `"strict": true` enables all strictness flags at once — this is the recommended starting point.

### 2.3 Rename and type `src/index.js`

- [ ] Rename `src/index.js` → `src/index.tsx`
- [ ] Update the `<script>` tag in `index.html` to point to `src/index.tsx`
- [ ] The only type fix needed: `document.getElementById('root')` can return `null`, but you know it exists. Add a non-null assertion:
  ```ts
  const root = ReactDOM.createRoot(document.getElementById('root')!);
  ```

### 2.4 Rename and type `src/components/FullscreenButton.js`

- [ ] Rename to `FullscreenButton.tsx`
- [ ] The `webkit*` fullscreen APIs (e.g. `webkitRequestFullscreen`) aren't in the standard TypeScript DOM types. Cast where needed:
  ```ts
  const el = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void>;
  };
  ```
  ```ts
  const doc = document as Document & {
    webkitExitFullscreen?: () => Promise<void>;
  };
  ```
- [ ] No component props to type (it takes none)

### 2.5 Rename and type `src/components/TaskList.js`

- [ ] Rename to `TaskList.tsx`
- [ ] Define a `Task` interface at the top of the file:
  ```ts
  interface Task {
    id: number;
    text: string;
    completed: boolean;
  }
  ```
- [ ] Define a props interface:
  ```ts
  interface TaskListProps {
    isLayoutEditMode?: boolean;
  }
  ```
- [ ] Add the type to the function signature: `function TaskList({ isLayoutEditMode = false }: TaskListProps)`
- [ ] Add the type to the `useState` call: `useState<Task[]>([])`
- [ ] Type the event handler parameter: `handleSubmit(event: React.FormEvent<HTMLFormElement>)`

### 2.6 Rename and type `src/components/PomodoroTimer.js`

This is the most complex file. Take it step by step.

- [ ] Rename to `PomodoroTimer.tsx`
- [ ] Define a props interface:
  ```ts
  interface PomodoroTimerProps {
    panelWidth: number;
    isLayoutEditMode?: boolean;
  }
  ```
- [ ] Add the type to the function signature
- [ ] Fix the `webkitAudioContext` browser API — it's not in standard types:
  ```ts
  const AudioCtx = window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  const audioContext = new AudioCtx();
  ```
- [ ] Explicitly type the `interval` ref/variable — TypeScript needs to know it's a `ReturnType<typeof setInterval>` or `null`:
  ```ts
  let interval: ReturnType<typeof setInterval> | null = null;
  ```

### 2.7 Rename and type `src/App.js`

- [ ] Rename to `App.tsx`
- [ ] No props interface needed (root component)
- [ ] All existing code should type-check without changes — it's already using typed values from child components

### 2.8 Verify type correctness

- [ ] Run `npx tsc --noEmit` — this checks types without producing output files
- [ ] Fix any errors it reports (there should be very few if you followed the steps above)
- [ ] Run `npm run build` — confirm the build still succeeds with `.tsx` files

### 2.9 Add type checking to CI

- [ ] Open `.github/workflows/deploy-pages.yml`
- [ ] Add a type check step in the `build` job, **before** the `npm run build` step:
  ```yaml
  - name: Type check
    run: npx tsc --noEmit
  ```
  > This ensures type errors block deployment — TypeScript errors won't silently ship.

### 2.10 Deploy and verify

- [ ] Commit all changes: `git add . && git commit -m "chore: migrate from JavaScript to TypeScript"`
- [ ] Push to main: `git push origin main`
- [ ] Confirm both CI jobs pass (type check + build + deploy)
- [ ] Verify the live site still works end-to-end

---

## Optional follow-on tasks (after both phases are done)

These aren't required but are good next steps for production quality:

- [ ] Add ESLint with `eslint-plugin-react` and `@typescript-eslint/eslint-plugin`
- [ ] Extract timer logic out of `PomodoroTimer.tsx` into a custom hook `usePomodoro.ts`
- [ ] Add an Error Boundary component to catch unexpected runtime errors gracefully
- [ ] Persist tasks to `localStorage` so they survive page refresh
- [ ] Write at least one unit test with Vitest (Vite's built-in test runner) + React Testing Library
