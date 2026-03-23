# FrameBench Analyzer — Claude Guidelines

## Project

Tauri v2 desktop app (Windows) for comparing NVIDIA GPU driver performance via frame-time CSV data. React + TypeScript frontend, Rust backend.

Key files:
- `src-tauri/src/lib.rs` — app setup, system tray, GPU polling loop
- `src-tauri/src/commands.rs` — all Tauri commands exposed to frontend
- `src-tauri/tauri.conf.json` — Tauri configuration
- `src/App.tsx` — main React component, file upload + analysis orchestration
- `src/lib/` — CSV parsing, analysis engine, report generation

---

## Dev vs Release: Critical Differences

Tauri dev mode (`npm run tauri:dev`) and release builds (`npm run tauri:build`) behave differently in ways that can hide bugs during development:

| Aspect | Dev | Release |
|--------|-----|---------|
| Frontend source | Vite dev server on `:5173` | Static files bundled from `dist/` |
| Devtools | Auto-opened | Not available |
| Logging plugin | Enabled | Disabled (`#[cfg(debug_assertions)]`) |
| Rust panics | May be swallowed silently | Crash the process immediately |
| Icon loading | Lenient | Strict — `None` if not configured |

**Always do a release test before considering a feature complete.** Dev working ≠ release working.

### The unwrap() trap (how we crashed on launch)

`app.default_window_icon()` returns `Option<&Image>`. In release builds it returns `None` because `"icon"` is **not a valid field** in `app.windows[0]` in Tauri v2's JSON schema — the schema validator silently removes it if added. Calling `.unwrap()` on a `None` panics the process before the window opens.

**Fix:** Use `tauri::include_image!("icons/icon.ico")` in `lib.rs` — it embeds the icon bytes at compile time and cannot fail at runtime:
```rust
// CORRECT — compile-time embed, always works:
.icon(tauri::include_image!("icons/icon.ico"))

// WRONG — panics in release when default_window_icon() returns None:
.icon(app.default_window_icon().unwrap().clone())
```

**Do NOT** try to add `"icon"` to the window config in `tauri.conf.json` — the Tauri schema rejects it.

**Rule:** Never use `.unwrap()` or `.expect()` in the Tauri `setup()` closure on anything that can be `None` or `Err` in a release build. Use `?` to propagate errors, or `if let Some(...)` to handle optionals gracefully.

---

## Rust Guidelines

- Use `?` inside `setup()` instead of `.unwrap()` — the closure returns `Result<(), Box<dyn Error>>`
- Use `.unwrap_or(default)` or `.unwrap_or_default()` for non-fatal fallbacks
- `.unwrap()` is acceptable only on `Mutex::lock()` (poisoned mutex = programming error) and compile-time constants (`env!()`)
- Any `.expect("message")` must explain a condition that truly cannot happen at runtime
- `spawn_blocking` is correct for `nvidia-smi` calls — don't move them to plain `async`

---

## Tauri Configuration Rules

- Do NOT add `"icon"` to `app.windows[0]` — it is not in the Tauri v2 schema and will be removed by the validator. The tray icon is set via `tauri::include_image!` in Rust (see above).
- `webviewInstallMode` **must be `"skip"`** — do NOT use `"downloadBootstrapper"`. The bootstrapper makes the app download WebView2 from Microsoft's CDN at startup; on machines with firewalls, proxies, or slow connections this blocks the UI thread causing "not responding". All Windows 10 1803+ and Windows 11 machines already have WebView2 pre-installed via Edge — no download is needed.
- Always add new Tauri plugins to both `Cargo.toml` **and** `capabilities/default.json` — missing permissions silently fail in release.
- CSP is currently `null` (disabled). Keep it that way unless adding web content from external origins.

---

## Frontend Guidelines

- Gate all Tauri-specific code behind the `isTauri` check:
  ```typescript
  const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
  ```
- Use dynamic `import('@tauri-apps/api/core')` for Tauri API calls — never top-level import in components that also render in browser/PWA mode
- Tauri invoke calls should always have a `.catch()` or be inside try/catch — they throw if the command errors
- No Supabase or external cloud dependencies — the app is fully local/offline

---

## Pre-ship Checklist

Before any `tauri build`, verify:

1. `npm run typecheck` — zero errors
2. `npm run build` — Vite build succeeds, no console errors
3. `tauri build` — Rust compiles cleanly, no warnings about unused `Result`
4. **Launch the `.exe` from `src-tauri/target/release/`** — confirm it opens without crashing
5. System tray icon appears in the Windows notification area
6. CSV upload works for both Dataset A and B
7. GPU widget shows live data (or gracefully shows "unavailable" if no NVIDIA GPU)
8. Report download works via the native Save As dialog

---

## Adding New Tauri Commands

1. Define the function in `src-tauri/src/commands.rs` with `#[tauri::command]`
2. Register it in the `.invoke_handler(tauri::generate_handler![...])` list in `lib.rs`
3. Add required permissions to `src-tauri/capabilities/default.json`
4. Call from frontend via `invoke('command_name', { arg })` behind the `isTauri` guard

## Adding New Tauri Plugins

1. Add to `src-tauri/Cargo.toml` under `[dependencies]`
2. Initialize with `.plugin(tauri_plugin_xxx::init())` in `lib.rs`
3. Add the plugin's permission identifier to `capabilities/default.json`
4. Test in **release mode** — plugin initialization failures are silent in dev

---

## What Not to Add

- No cloud/database dependencies (Supabase, Firebase, etc.) — this is a local desktop tool
- No service workers in the Tauri build path (already gated in `src/main.tsx`)
- No hardcoded localhost URLs in frontend code — they break in release where there is no dev server
- **No external CDN font imports** (`@import url('https://fonts.googleapis.com/...')`) — WebView2 blocks rendering until the CDN responds; on machines with firewalls or no internet this causes "not responding". Always self-host fonts via `@fontsource/<font-name>` and import the weight CSS files in `src/main.tsx`.
- **No external URLs in `index.html` meta tags** — they fire network requests on every launch and expose scaffolding tool origins (bolt.new, etc.)

## Windows Release Requirements

- Static CRT linking is configured in `src-tauri/.cargo/config.toml` — do not remove it. Without it, the release binary requires `vcruntime140.dll` to be installed on the target machine, which may be absent on clean Windows installs.
- `webviewInstallMode` is set to `"skip"` — do not change it to `"downloadBootstrapper"`. The bootstrapper blocks the UI thread while downloading WebView2 and causes "not responding" on machines with firewalls or slow connections.
