# FrameBench Analyzer

Analyze frame-time telemetry, detect stutter, and validate performance across drivers, hardware, and game settings. Identify regressions and generate shareable reports in minutes, not hours.

Supports native NVIDIA FrameView CSV exports and generic frame time formats. Ships as a **Windows desktop app** (Tauri v2, ~3.5 MB installer)

## Dashboard Demo

![FrameBench Analyzer](public/screenshots/framebench-analyzer.png)

## Live Demo

https://vinodh-framebench-analyzer.bolt.host

## Architecture Diagram

Phase 1:

![FrameBench Analyzer](public/screenshots/Phase-1-Architecture.png)

Phase 2:

![FrameBench Analyzer](public/screenshots/Phase-2-Architecture.png)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) — desktop app only
- Windows 10 1803+ or Windows 11 — WebView2 is pre-installed via Edge; the setup installer bundles a bootstrapper for older machines

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. 

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
./src-tauri/target/release/FrameBench Analyzer.exe
```

---

## Overview

FrameBench Analyzer processes frame time telemetry from gameplay benchmarks and produces detailed performance analysis including regression detection, QA scoring, anomaly classification, and exportable HTML reports.

FrameBench powers critical workflows across driver validation, hardware benchmarking, and game settings optimization.

All analysis is performed locally. No cloud services or external databases are required.

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
CSVs up to 50,000 rows processed via a Web Worker to avoid UI blocking. Files above 25,000 frames show a truncation notice; all frame statistics are computed from the full dataset.

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

Falls back to simulated display values gracefully when no NVIDIA GPU is present or when running in the browser/PWA.

**System Tray** *(Tauri only)*
App minimizes to the Windows system tray. Tray icon tooltip shows live GPU temperature and power (`FrameBench Analyzer | GPU 72°C  245W`). Right-click menu provides Show / Hide and Quit.

**Native Save Report Dialog** *(Tauri only)*
The "Download Report" button opens a native Windows Save As dialog. On the browser/PWA, reports download via the standard blob mechanism.

**Windows Toast Notifications** *(Tauri only)*
A native toast notification fires when a performance regression is detected after uploading both driver CSVs.

**Native File Picker** *(Tauri only)*
CSV upload uses the OS file open dialog instead of the HTML file input.

**Administrator Elevation** *(Tauri only)*
If GPU stats are unavailable due to permissions, a one-click "Restart as Administrator" button relaunches the app with elevated privileges.

---

### Report & Persistence

**HTML Report Export**
Self-contained HTML performance report with dark NVIDIA-styled layout. Includes all metrics, QA analysis, anomaly breakdown, and regression verdict. Saved natively (desktop) or downloaded as a file (browser).

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
6. Download the HTML report via the native Save As dialog (desktop) or browser download
7. Use demo mode to explore the full workflow without real captures

---

## Future Improvements

- macOS / Linux desktop builds (Tauri cross-compile)
- DLSS / image quality artifact detection
- Automated benchmark ingestion pipeline
- Multi-session trend analysis across driver versions
- Rolling GPU telemetry history chart
- ML-based frame pacing anomaly prediction

---

## Inspiration

Built as a tooling prototype for hardware performance analysis and GPU driver QA pipelines used in graphics driver validation labs.

---

## Author

Vinodh Shekhar -Gamer and AI Product Manager

---

## Contributors

**[Karan Balaji](https://www.linkedin.com/in/karanbalaji/)** — Windows desktop app (Tauri v2)

Migrated the app from Electron to Tauri v2 (Rust backend + WebView2), reducing the installer from ~200 MB to 3.5 MB. Added native Windows features: live GPU telemetry via `nvidia-smi`, system tray with live GPU stats, native Save As dialog for reports, Windows toast notifications on regression detection, and administrator elevation for GPU access.
