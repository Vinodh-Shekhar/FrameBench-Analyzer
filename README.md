# FrameBench Analyzer

GPU driver benchmarking and frame time telemetry analysis tool for detecting frame pacing instability, stutter events, and performance regressions between driver builds.

Supports native NVIDIA FrameView CSV exports and generic frame time formats. Ships as a **Windows desktop app** (Tauri v2, 3.5 MB installer) and a **PWA** with offline support.

## Dashboard Demo

![FrameBench Analyzer](public/screenshots/framebench-analyzer.png)

## Performance Report

![Performance Report](public/screenshots/Performance-Report.png)

## Live Demo

https://vinodh-framebench-analyzer.bolt.host

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) — desktop app only
- [Microsoft WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) — pre-installed on Windows 11; auto-downloaded on Windows 10 if missing

### Web / PWA

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. Install as a PWA from the browser's install prompt for offline support.

### Windows Desktop App (Tauri)

**Development with hot-reload:**
```bash
npm install
npm run tauri:dev
```

Opens the native window with hot-reload. DevTools open automatically.

**Production build:**
```bash
npm run tauri:build
```

Outputs installer to:
```
src-tauri/target/release/bundle/nsis/FrameBench Analyzer_1.0.0_x64-setup.exe
```

**Run without installing:**
```bash
./src-tauri/target/release/app.exe
```

---

## Overview

FrameBench Analyzer processes frame time telemetry from gameplay benchmarks and produces detailed performance analysis including regression detection, QA scoring, anomaly classification, and exportable HTML reports.

Runs as a native Windows desktop app (Rust/Tauri v2 backend) or as a browser PWA. Desktop-only features — live GPU monitoring, system tray, native save dialog, toast notifications — are available exclusively in the desktop build.

---

## Key Features

### Analysis

**Driver Comparison Mode**
Upload telemetry CSVs from two driver builds and compare frame pacing, FPS, variance, and stutter side by side with automatic regression detection.

**QA Anomaly Detection**
Z-score based spike detection classifies frame time anomalies as High / Medium / Low severity. Assigns an overall QA score (0–100) with a PASS / WARNING / FAIL stability rating.

**Driver Regression Detection**
Automatically flags regressions when: FPS drops more than 3%, frame time variance increases more than 20%, or stutter score increases more than 2 points versus the baseline driver.

**Large File Processing**
CSVs up to 50,000 rows processed via a Web Worker to avoid UI blocking. Files above 25,000 frames are noted as truncated; full frame counts are preserved in metadata.

**Multi-Format CSV Ingestion**
Accepts FrameView exports (`MsBetweenPresents`, `MsBetweenDisplayChange`), PresentMon (`FrameTime`), and generic frame time CSVs. Compressed `.csv.gz` files supported. `NA` values and extra columns handled gracefully.

**Native NVIDIA FrameView CSV Support**
Hardware metadata — GPU model, CPU model, render resolution, application name — is auto-extracted from the FrameView file header.

---

### Visualization

**Frame Time Charts**
Line chart per dataset showing frame delivery over time with average reference line. Sampled to 500 points for render performance.

**Comparison Overlay**
Both datasets plotted on the same axes for direct A vs B frame time comparison.

**Frame Time Distribution Histograms**
2ms-binned histogram showing frame time spread. Stutter spikes (>30ms) highlighted in red with event count.

**Circular Score Indicators**
Animated SVG rings for GPU Stability Score, Frame Pacing Score, and Benchmark Reliability verdict at the top of the dashboard.

**Demo Mode**
"Generate Sample Telemetry" creates two synthetic 1,200-frame datasets — a stable baseline (PASS, ~92 score) and a stuttery comparison (WARNING, ~65 score) — for exploring the workflow without real captures.

---

### Desktop App — Native Windows Features

**Live GPU Hardware Monitoring** *(Tauri only)*
Real-time GPU stats via `nvidia-smi` polled every 3 seconds. Displays:
- Core Temperature
- Power Draw
- VRAM Usage
- Fan Speed
- GPU Utilization %
- Core Clock MHz
- Memory Clock MHz
- Performance State (P0–P8)

Falls back to simulated display values gracefully when no NVIDIA GPU is present.

**Rolling GPU Telemetry Chart** *(Tauri only)*
6-minute rolling time-series chart of GPU temperature, utilization, power draw, and core clock. Sampled every 3 seconds (120 samples), rendered with dual Y-axes via Recharts. Appears automatically below the upload grid once data starts accumulating.

**System Tray** *(Tauri only)*
App minimizes to the Windows system tray. Tray icon tooltip shows live GPU temperature and power (`FrameBench Analyzer | GPU 72°C  245W`). Right-click menu provides Show / Hide and Quit.

**Native Save Report Dialog** *(Tauri only)*
The "Download Report" button opens a native Windows Save As dialog. On the browser/PWA, reports download via the standard blob mechanism.

**Windows Toast Notifications** *(Tauri only)*
A native toast notification fires when a performance regression is detected after uploading both driver CSVs.

**Native File Picker** *(Tauri only)*
CSV upload uses the OS file open dialog instead of the HTML file input.

---

### Report & Persistence

**HTML Report Export**
Self-contained HTML performance report with dark NVIDIA-styled layout. Includes all metrics, QA analysis, anomaly breakdown, and regression verdict. Saved natively (desktop) or downloaded as a file (browser).

**Supabase Persistence**
Sessions and results are persisted to a Supabase database. Up to 10,000 frames per driver are sampled and stored for historical review.

**PWA / Offline Support**
Service worker provides cache-first offline capability when installed as a PWA. Disabled in the Tauri desktop context (not needed).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite 5, Tailwind CSS 3 |
| Charts | Recharts 3 |
| Desktop backend | Tauri v2 (Rust) |
| GPU data | `nvidia-smi` via `std::process::Command` |
| Native dialogs | `tauri-plugin-dialog` |
| Notifications | `tauri-plugin-notification` |
| Installer | NSIS (Windows x64, ~3.5 MB) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| PWA | Vite PWA plugin + service worker |

---

## Supported CSV Formats

| Source | Required Column | Notes |
|---|---|---|
| NVIDIA FrameView | `MsBetweenPresents` or `MsBetweenDisplayChange` | Also parses GPU, CPU, resolution, application metadata |
| PresentMon | `FrameTime` or `frame_time` | |
| Generic | `FrameTime`, `frame_time`, or `frame time` | Any CSV with a recognizable frame time column |

Compressed `.csv.gz` files are supported alongside plain `.csv`.

---

## Metrics Calculated

| Metric | Description |
|---|---|
| Average FPS | Mean frames per second |
| 1% Low FPS | Frame rate at the 1st percentile — worst-case stutter |
| 0.1% Low FPS | Frame rate at the 0.1st percentile — extreme outliers |
| Min / Max FPS | Absolute floor and ceiling |
| Average Frame Time | Mean milliseconds per frame |
| Frame Time Variance | Statistical variance of frame delivery timing |
| Frame Pacing Stability | 0–100% consistency score |
| Stutter Score | % of frames delivered more than 1.5× slower than average |
| QA Overall Score | 0–100 composite from stability, variance, and anomaly counts |
| Stability Rating | PASS / WARNING / FAIL |

---

## GPU Telemetry Fields (Desktop)

Queried live from `nvidia-smi` every 3 seconds:

| Field | Unit |
|---|---|
| Core Temperature | °C |
| Power Draw | W |
| VRAM Used / Total | MB |
| Fan Speed | % |
| GPU Utilization | % |
| Core Clock | MHz |
| Memory Clock | MHz |
| Performance State | P0–P8 |

---

## Example Workflow

1. Run a gameplay benchmark with NVIDIA FrameView (or any compatible tool)
2. Export the capture as a CSV
3. Open FrameBench Analyzer — upload the CSV; hardware metadata is auto-detected
4. Upload a second CSV for the comparison driver
5. Metrics, QA analysis, and regression verdict are computed automatically
6. Download the HTML report (native Save As dialog on desktop) or save the session to Supabase
7. Use demo mode to explore the full workflow without real captures

---

## Database Schema

Data persisted to Supabase with Row Level Security. Anonymous users can read and write records from the last 24 hours.

### `telemetry_sessions`

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `session_name` | text | Auto-generated label |
| `driver_a_name` | text | Driver A filename |
| `driver_b_name` | text | Driver B filename |
| `gpu_name` | text | GPU model from FrameView CSV |
| `cpu_name` | text | CPU model from FrameView CSV |
| `resolution` | text | Render resolution from FrameView CSV |
| `application` | text | Game/app name from FrameView CSV |
| `csv_source` | text | `frameview` or `generic` |
| `created_at` | timestamptz | Creation timestamp |

### `frame_data`

Sampled to 10,000 frames per driver before storage.

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `session_id` | uuid | FK to `telemetry_sessions` |
| `driver_label` | text | `A` or `B` |
| `frame_number` | integer | Sequential index |
| `frame_time` | float8 | Frame duration in ms |
| `created_at` | timestamptz | Creation timestamp |

### `comparison_results`

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `session_id` | uuid | FK to `telemetry_sessions` |
| `metrics_a` | jsonb | Computed metrics for Driver A |
| `metrics_b` | jsonb | Computed metrics for Driver B |
| `qa_analysis_a` | jsonb | QA anomaly analysis for Driver A |
| `qa_analysis_b` | jsonb | QA anomaly analysis for Driver B |
| `regression_result` | jsonb | Regression verdict and details |
| `created_at` | timestamptz | Creation timestamp |

---

## Future Improvements

- macOS / Linux desktop builds (Tauri cross-compile)
- DLSS / image quality artifact detection
- Automated benchmark ingestion pipeline
- Multi-session trend analysis across driver versions
- ML-based frame pacing anomaly prediction

---

## Inspiration

Built as a tooling prototype for hardware performance analysis and GPU driver QA pipelines used in graphics driver validation labs.

---

## Author

Vinodh Shekhar

---

## Contributors

**[Karan Balaji](https://www.linkedin.com/in/karanbalaji/)** — Windows desktop app (Tauri v2)

Migrated the app from Electron to Tauri v2 (Rust backend + WebView2), reducing the installer from ~200 MB to 3.5 MB. Added native Windows features: live GPU telemetry via `nvidia-smi`, rolling telemetry history chart, system tray with live GPU stats, native Save As dialog for reports, and Windows toast notifications on regression detection.
