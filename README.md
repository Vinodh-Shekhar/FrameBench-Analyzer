# NeuralDriver Analyzer

AI-assisted GPU driver validation dashboard for detecting frame pacing instability, stutter events, and performance regressions between driver builds.

Supports native Nvidia FrameView CSV exports as well as generic frame time capture formats.

## Dashboard Demo

![NeuralDriver Performance Analyzer](screenshots/dashboard-demo.png)

## Live Demo

https://vinodh-neuraldriver-analyzer.bolt.host

---

## Overview

NeuralDriver Analyzer analyzes frame time telemetry collected during gameplay benchmarks.

The tool detects:

- Frame pacing instability
- Micro stutters
- Performance regressions between driver builds
- Frame time anomalies using AI-based analysis

Sessions and their results are persisted to a Supabase database so historical comparisons can be reviewed at any time.

This enables faster validation of GPU drivers before release.

---

## Key Features

Driver Comparison Mode
Upload telemetry from two driver builds (Driver A vs Driver B) and compare performance stability side by side.

Native Nvidia FrameView CSV Support
Upload CSV files exported directly from Nvidia FrameView. Hardware metadata — GPU model, CPU model, render resolution, and application name — is automatically extracted from the file and displayed in the session header.

Multi-Format CSV Ingestion
Accepts FrameView exports (`MsBetweenPresents`, `MsBetweenDisplayChange`), PresentMon captures (`FrameTime`), and generic frame time CSVs. `NA` values and extra columns are handled gracefully.

Hardware Context Display
After upload, the GPU widget shows the detected GPU name, CPU, resolution, and game/application. This context is stored with the session for later reference.

Frame Time Analysis
Visualize frame pacing and detect irregular frame delivery with real-time charts.

AI-Assisted Anomaly Detection
Identify frame spikes that indicate rendering instability using statistical spike detection.

Driver Regression Detection
Automatically detect when a new driver introduces performance regressions versus a known-good baseline.

Telemetry Dashboard
Modern developer-style dashboard inspired by GPU monitoring tools, with animated GPU widget, frame time charts, and distribution histograms.

---

## Supported CSV Formats

| Source | Required Column |
|---|---|
| Nvidia FrameView | `MsBetweenPresents` or `MsBetweenDisplayChange` |
| PresentMon | `FrameTime` or `frame_time` |
| Generic | `FrameTime`, `frame_time`, or `frame time` |

FrameView exports additionally provide hardware metadata columns (`Application`, `GPU`, `CPU`, `Resolution`) which are parsed automatically when present.

---

## Metrics Calculated

Average FPS

1% Low FPS

0.1% Low FPS

Frame Time Variance

Frame Stability Score

Stutter Detection

Driver Stability Verdict

Frame Time Distribution Visualization

---

## Example Workflow

1. Run a gameplay benchmark and capture frame times using Nvidia FrameView (or any compatible tool)
2. Export the capture as a CSV file
3. Upload the CSV for Driver A; hardware metadata (GPU, CPU, resolution, application) is auto-detected
4. Upload a second CSV for Driver B from a different driver build
5. NeuralDriver Analyzer processes both datasets and highlights instability and regression risks
6. Session results — including hardware context and regression verdict — are saved to the database

---

## Database Schema

Data is stored in Supabase with Row Level Security enabled on all tables.

### `telemetry_sessions`

Stores one record per comparison session.

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `session_name` | text | User-defined session label |
| `driver_a_name` | text | Label for Driver A build |
| `driver_b_name` | text | Label for Driver B build |
| `gpu_name` | text | GPU model auto-detected from FrameView CSV |
| `cpu_name` | text | CPU model auto-detected from FrameView CSV |
| `resolution` | text | Render resolution auto-detected from FrameView CSV |
| `application` | text | Application/game name from FrameView CSV |
| `csv_source` | text | Source format: `frameview` or `generic` |
| `created_at` | timestamptz | Session creation timestamp |

### `frame_data`

Stores per-frame telemetry rows linked to a session.

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `session_id` | uuid | Foreign key to `telemetry_sessions` |
| `driver_label` | text | `A` or `B` |
| `frame_number` | integer | Sequential frame index |
| `frame_time` | float8 | Frame duration in milliseconds |
| `created_at` | timestamptz | Row creation timestamp |

### `comparison_results`

Stores computed metrics and regression analysis for a session.

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `session_id` | uuid | Foreign key to `telemetry_sessions` |
| `metrics_a` | jsonb | Computed metrics for Driver A |
| `metrics_b` | jsonb | Computed metrics for Driver B |
| `qa_analysis_a` | jsonb | QA anomaly analysis for Driver A |
| `qa_analysis_b` | jsonb | QA anomaly analysis for Driver B |
| `regression_result` | jsonb | Regression verdict and details |
| `created_at` | timestamptz | Result creation timestamp |

---

## Future Improvements

Planned upgrades include:

- DLSS artifact detection
- Automated benchmark ingestion pipeline
- ML-based frame pacing prediction
- Multi-session trend analysis across driver versions

---

## Inspiration

This project was created as a prototype for AI-assisted GPU driver QA pipelines used in graphics driver validation labs.

---

## Author

Vinodh Shekhar
