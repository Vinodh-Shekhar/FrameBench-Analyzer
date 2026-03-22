# FrameBench Analyzer — Phase 2: Native Windows Features

> Rust/Tauri-native enhancements that are only possible in the desktop app

**Status:** ✅ Complete &nbsp;|&nbsp; **Overall Progress:** `100%`
**Date Completed:** 2026-03-22
**Installer Size:** 3.5 MB (up from 3.4 MB — added tray, notification, tokio)
**Binary Size:** 13 MB (`app.exe`, release build)

---

## Summary

Phase 2 adds 5 native Windows features that leverage the Rust backend introduced in Phase 1. None of these are available in the PWA/browser version — they are gated behind `isTauri` checks on the frontend and implemented as Tauri commands or core Tauri APIs on the backend.

| # | Feature | Status |
|---|---|---|
| F1 | Extended GPU Telemetry (util %, clocks, P-state) | ✅ |
| F2 | Rolling GPU Telemetry History Chart (6-min window) | ✅ |
| F3 | Native Save Report (OS Save As dialog) | ✅ |
| F4 | System Tray (live GPU temp tooltip, Show/Hide/Quit) | ✅ |
| F5 | Windows Toast Notifications (regression alert) | ✅ |

---

## F1 — Extended GPU Telemetry

### What it does
Adds 4 new fields to the GPU status widget alongside the existing temperature, power, VRAM, and fan stats:
- **GPU Utilization %** — how busy the shader cores are
- **Core Clock MHz** — current graphics clock speed
- **Mem Clock MHz** — current VRAM clock speed
- **P-State** — NVIDIA performance state (P0 = max performance, P8 = idle), shown as a badge

### Files changed
| File | Change |
|---|---|
| `src-tauri/src/commands.rs` | Extended `GpuStats` struct with 4 new fields; updated nvidia-smi query to 10 fields; updated `unavailable_stats()` |
| `src/components/GpuStatusWidget.tsx` | Extended `GpuStats` TS interface; added 3 new `<GpuStat>` rows (util, core clock, mem clock); P-state badge in the footer alongside MONITORING/STANDBY |

### nvidia-smi query
```
--query-gpu=name,temperature.gpu,power.draw,memory.used,memory.total,fan.speed,
            utilization.gpu,clocks.current.graphics,clocks.current.memory,pstate
--format=csv,noheader,nounits
```

### Bar scaling
| Field | Ceiling |
|---|---|
| GPU Utilization | 100 (direct %) |
| Core Clock | 3000 MHz |
| Mem Clock | 12000 MHz (GDDR6X) |

### Notes
- `pstate` returns `"[N/A]"` on some Quadro/datacenter GPUs — hidden when that value is returned
- `GpuStats` struct now derives `Clone` (needed for F2's snapshot history)

---

## F2 — Rolling GPU Telemetry History Chart

### What it does
Shows a real-time 6-minute rolling chart of GPU temperature, utilization, power draw, and core clock speed below the upload panel grid. Samples every 3 seconds (120 samples maximum). Only visible in the desktop app.

### Architecture
A Rust background task runs continuously, polling nvidia-smi every 3 seconds and pushing `GpuSnapshot` records into a `VecDeque<GpuSnapshot>` capped at 120 entries. This buffer is stored as Tauri managed state. The frontend polls `get_gpu_history` every 3 seconds and renders the data with Recharts.

### Files changed
| File | Change |
|---|---|
| `src-tauri/src/commands.rs` | New `GpuSnapshot` struct `{ timestamp_secs, temperature, power_draw, core_clock_mhz, gpu_utilization }`; new `GpuHistoryState` managed state struct; new `get_gpu_history()` command |
| `src-tauri/src/lib.rs` | Registers `GpuHistoryState` via `.manage()`; spawns background `tauri::async_runtime::spawn` polling loop using `spawn_blocking` for nvidia-smi; updates tray tooltip from the loop |
| `src-tauri/Cargo.toml` | Added `tokio = { version = "1", features = ["time"] }` |
| `src/components/GpuTelemetryChart.tsx` | **New file** — Recharts `LineChart` with dual Y-axes; polls `get_gpu_history` every 3s; shows "Collecting data…" until 2 samples available |
| `src/App.tsx` | Imports and renders `<GpuTelemetryChart />` below the 3-column grid, gated by `isTauri` |

### Chart layout
- **Left Y-axis (0–100):** Temp °C (`#76B900` nvidia-green), Util % (`#00ff9c` nvidia-accent)
- **Right Y-axis (auto):** Power W (`#f59e0b` amber), Core MHz (`#00b4d8` cyan)
- **X-axis:** Relative seconds from session start (`T+0s`, `T+3s`, …)
- `isAnimationActive={false}` for smooth live updates without jank

### Key implementation detail
`tauri::State<T>` is request-scoped and cannot be passed into spawned async tasks. The inner `Arc<Mutex<VecDeque<GpuSnapshot>>>` is cloned out of managed state before spawning, and that clone is moved into the task.

---

## F3 — Native Save Report

### What it does
When the "Download Report" button is clicked in the desktop app, instead of the browser blob/anchor download trick, a native Windows Save As dialog opens. The user picks a filename and location; the HTML file is written directly to disk via Rust.

### Files changed
| File | Change |
|---|---|
| `src-tauri/src/commands.rs` | New `save_report(app, html) -> Result<String, String>` async command; uses `tauri_plugin_dialog::DialogExt` for the save dialog and `std::fs::write` to write the file |
| `src-tauri/src/lib.rs` | Added `commands::save_report` to `generate_handler!` |
| `src-tauri/capabilities/default.json` | Added `dialog:allow-save`, `fs:allow-write-file`, and `fs:scope` allowing `$DESKTOP`, `$DOCUMENT`, `$DOWNLOAD`, `$HOME` |
| `src/lib/reportGenerator.ts` | Extracted `export function buildReportHtml(input): string` (returns HTML string); `generateReport` now calls `buildReportHtml` + existing blob download (browser path unchanged) |
| `src/App.tsx` | `handleDownloadReport` is now `async`; branches on `isTauri` — Tauri path calls `invoke('save_report', { html })`; browser path calls `generateReport()` |

### Why `std::fs::write` instead of `tauri-plugin-fs`
`tauri-plugin-fs` is an IPC bridge for frontend JavaScript file operations. From Rust code, `std::fs::write` is the correct and simpler approach — no plugin needed.

### Save dialog config
```rust
app.dialog().file()
    .set_title("Save FrameBench Report")
    .add_filter("HTML Report", &["html"])
    .set_file_name("framebench-report.html")
    .blocking_save_file()
```

Returns `None` on cancel (handled gracefully — no error shown to user).

---

## F4 — System Tray

### What it does
The app minimizes to the Windows system tray rather than closing. The tray icon tooltip shows live GPU temperature and power draw (e.g. `FrameBench Analyzer | GPU 72°C  245W`), updated every 3 seconds by the GPU polling loop. Right-clicking the icon shows a context menu with **Show / Hide** and **Quit**.

### Files changed
| File | Change |
|---|---|
| `src-tauri/src/lib.rs` | Tray setup using `tauri::tray::TrayIconBuilder` and `tauri::menu::{Menu, MenuItem}`; tray handle stored in managed state to prevent drop; `TrayIcon` clone passed into the GPU polling task for tooltip updates |
| `src-tauri/Cargo.toml` | Added `"tray-icon"` feature to the `tauri` dependency |

### Key implementation details
- `tauri-plugin-tray` does not exist as a crate — the tray is built into the Tauri core crate behind the `tray-icon` feature flag
- `TrayIcon` must be kept alive (stored in managed state); if it's dropped, the tray icon disappears
- Menu event handler uses `event.id().as_ref()` to match string IDs `"quit"` and `"show_hide"`
- Tray capabilities are NOT required when the tray is managed entirely from Rust (capabilities gate the IPC bridge, not Rust-side calls)

### Tooltip format
```
FrameBench Analyzer | GPU {temp}°C  {power}W
```
Falls back to `"FrameBench Analyzer"` if nvidia-smi is unavailable (the polling task simply doesn't push to the buffer).

---

## F5 — Windows Toast Notifications

### What it does
When analysis of two driver CSVs detects a performance regression, a native Windows toast notification fires immediately: **"Regression Detected"** with the regression summary as the body text.

### Files changed
| File | Change |
|---|---|
| `src-tauri/src/commands.rs` | New `show_notification(app, title, body) -> Result<(), String>` command using `tauri_plugin_notification::NotificationExt` |
| `src-tauri/src/lib.rs` | Registered `.plugin(tauri_plugin_notification::init())` |
| `src-tauri/Cargo.toml` | Added `tauri-plugin-notification = "2"` |
| `src-tauri/capabilities/default.json` | Added `"notification:default"` |
| `src/App.tsx` | After `detectRegression()` returns `isRegressed: true` in both `handleFileA` and `handleFileB`, invokes `show_notification` if running in Tauri |

### Important caveat
Toast notifications require an **AppUserModelId (AUMID)** registered with Windows. Tauri automatically sets this from `tauri.conf.json` `identifier` (`com.framebench.analyzer`) in packaged builds. In `tauri dev`, the AUMID may not be registered, causing the notification to fail silently — this is expected. All notification calls are wrapped in `.catch(() => {})`.

---

## New Dependencies

### `src-tauri/Cargo.toml`
```toml
tauri = { version = "2", features = ["tray-icon", "devtools"] }
tauri-plugin-notification = "2"
tokio = { version = "1", features = ["time"] }
```

### `src-tauri/capabilities/default.json`
```json
"dialog:allow-save",
"fs:allow-write-file",
"notification:default",
{ "identifier": "fs:scope", "allow": [
    { "path": "$DESKTOP/**" },
    { "path": "$DOCUMENT/**" },
    { "path": "$DOWNLOAD/**" },
    { "path": "$HOME/**" }
]}
```

---

## File Change Map

| File | Type | Change |
|---|---|---|
| `src-tauri/src/commands.rs` | Modified | Extended `GpuStats`; new `GpuSnapshot`, `GpuHistoryState`, `get_gpu_history`, `save_report`, `show_notification` |
| `src-tauri/src/lib.rs` | Modified | GPU polling task, tray setup, plugin registrations, managed state |
| `src-tauri/Cargo.toml` | Modified | +`tokio`, +`tauri-plugin-notification`, +`tray-icon`/`devtools` features |
| `src-tauri/capabilities/default.json` | Modified | +save, +write, +notification, +fs:scope |
| `src/components/GpuStatusWidget.tsx` | Modified | 4 new fields in interface; 3 new stat rows; P-state badge |
| `src/components/GpuTelemetryChart.tsx` | **New** | Rolling telemetry chart component |
| `src/lib/reportGenerator.ts` | Modified | Extracted `buildReportHtml()` returning string |
| `src/App.tsx` | Modified | `GpuTelemetryChart` render; async `handleDownloadReport`; regression notification trigger |

---

## Verification Checklist

- [ ] `npm run tauri:dev` — GPU widget shows util %, core clock, mem clock, P-state badge
- [ ] After ~9s of running, `GpuTelemetryChart` appears below the upload grid with live lines
- [ ] Tray icon appears in Windows notification area on launch
- [ ] Tray tooltip shows GPU temp and power (or default text if no NVIDIA GPU)
- [ ] Tray right-click → Show/Hide toggles the window; Quit exits
- [ ] Download Report button → native Save As dialog opens (Tauri), blob download (browser)
- [ ] Upload 2 CSVs with regression → toast fires in packaged build
- [ ] `npm run tauri:build` — NSIS installer produced (~3.5 MB), no compile errors
