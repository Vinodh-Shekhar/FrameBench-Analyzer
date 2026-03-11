# NeuralDriver Analyzer

AI-assisted GPU driver validation dashboard for detecting frame pacing instability, stutter events, and performance regressions between driver builds.

This prototype simulates a GPU QA validation tool similar to those used in graphics driver testing pipelines.

## Dashboard Demo

![NeuralDriver QA Inspector](screenshots/dashboard-demo.png)

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

This enables faster validation of GPU drivers before release.

---

## Key Features

Driver Comparison Mode  
Upload telemetry from two driver builds and compare performance stability.

Frame Time Analysis  
Visualize frame pacing and detect irregular frame delivery.

AI-Assisted Anomaly Detection  
Identify frame spikes that indicate rendering instability.

Driver Regression Detection  
Automatically detect when a new driver introduces performance regressions.

Telemetry Dashboard  
Modern developer-style dashboard inspired by GPU monitoring tools.

---

## Metrics Calculated

Average FPS

Frame Time Variance

Frame Stability Score

Stutter Detection

Driver Stability Verdict

Average FPS

1% Low FPS

0.1% Low FPS

Frame Stability Score

Frame Time Distribution Visualization

---

## Example Workflow

1. Capture frame telemetry during gameplay benchmarks
2. Upload telemetry data for two drivers
3. NeuralDriver Analyzer processes frame timing
4. The dashboard highlights instability and regression risks

---

## Example Telemetry Input

Frame spikes indicate potential stutter events.

---

## Future Improvements

Planned upgrades include:

- 1% and 0.1% low FPS analysis
- DLSS artifact detection
- Automated benchmark ingestion
- GPU telemetry integration
- ML-based frame pacing prediction

---

## Inspiration

This project was created as a prototype for AI-assisted GPU driver QA pipelines used in graphics driver validation labs.

---

## Author

Vinodh Shekhar
