import type {
  DriverDataset,
  PerformanceMetrics,
  QAAnalysis,
  RegressionResult,
} from '../types/telemetry';

interface ReportInput {
  datasetA: DriverDataset | null;
  datasetB: DriverDataset | null;
  metricsA: PerformanceMetrics | null;
  metricsB: PerformanceMetrics | null;
  analysisA: QAAnalysis | null;
  analysisB: QAAnalysis | null;
  regression: RegressionResult | null;
}

function fmtVal(v: number | undefined, decimals = 2): string {
  return v !== undefined ? v.toFixed(decimals) : 'N/A';
}

function stabilityColor(rating: 'PASS' | 'WARNING' | 'FAIL'): string {
  if (rating === 'PASS') return '#76b900';
  if (rating === 'WARNING') return '#f59e0b';
  return '#ef4444';
}

function metricRow(label: string, valA: string, valB: string, unit = ''): string {
  return `
    <tr>
      <td class="label">${label}</td>
      <td class="val-a">${valA}${unit ? `<span class="unit"> ${unit}</span>` : ''}</td>
      <td class="val-b">${valB}${unit ? `<span class="unit"> ${unit}</span>` : ''}</td>
    </tr>`;
}

function warningList(warnings: string[]): string {
  if (warnings.length === 0) return '<p class="none">No warnings detected.</p>';
  return warnings.map(w => `<div class="warning-item">${w}</div>`).join('');
}

export function buildReportHtml(input: ReportInput): string {
  const { datasetA, datasetB, metricsA, metricsB, analysisA, analysisB, regression } = input;
  const ts = new Date().toLocaleString();

  const metaA = datasetA?.metadata;
  const metaB = datasetB?.metadata;

  const gpuA = metaA?.gpu || datasetA?.fileName || 'Dataset A';
  const gpuB = metaB?.gpu || datasetB?.fileName || 'Dataset B';
  const cpuA = metaA?.cpu || '';
  const cpuB = metaB?.cpu || '';
  const resA = metaA?.resolution || '';
  const resB = metaB?.resolution || '';
  const appA = metaA?.application || '';
  const appB = metaB?.application || '';

  const ratingA = analysisA?.stabilityRating ?? 'N/A';
  const ratingB = analysisB?.stabilityRating ?? 'N/A';
  const colorA = analysisA ? stabilityColor(analysisA.stabilityRating) : '#9ca3af';
  const colorB = analysisB ? stabilityColor(analysisB.stabilityRating) : '#9ca3af';

  const regressionBadge = regression
    ? regression.isRegressed
      ? `<span class="badge badge-fail">REGRESSION DETECTED</span>`
      : `<span class="badge badge-pass">STABLE</span>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>FrameBench Report — ${ts}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Courier New', Courier, monospace;
    background: #0f1117;
    color: #e2e8f0;
    padding: 32px;
    font-size: 13px;
    line-height: 1.6;
  }
  h1 { font-size: 22px; font-weight: 700; color: #76b900; letter-spacing: 0.05em; margin-bottom: 4px; }
  h2 { font-size: 13px; font-weight: 600; color: #76b900; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }
  h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 8px; }
  .header { border-bottom: 1px solid #1e2a38; padding-bottom: 20px; margin-bottom: 28px; }
  .header .subtitle { color: #64748b; font-size: 11px; margin-top: 4px; }
  .section { border: 1px solid #1e2a38; border-radius: 8px; padding: 20px; margin-bottom: 20px; background: #141820; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .meta-col { background: #0f1117; border-radius: 6px; padding: 12px; border: 1px solid #1e2a38; }
  .meta-col .col-label { font-size: 10px; color: #76b900; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; font-weight: 700; }
  .meta-row { display: flex; justify-content: space-between; gap: 8px; padding: 3px 0; border-bottom: 1px solid #1e2a3820; }
  .meta-row:last-child { border-bottom: none; }
  .meta-row .key { color: #64748b; font-size: 11px; }
  .meta-row .val { color: #e2e8f0; font-size: 11px; text-align: right; max-width: 60%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  table { width: 100%; border-collapse: collapse; }
  thead th { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; padding: 6px 8px; border-bottom: 1px solid #1e2a38; text-align: left; }
  thead th.val-a { color: #76b900; }
  thead th.val-b { color: #00b4d8; }
  tbody tr:nth-child(even) { background: #0f111720; }
  tbody td { padding: 7px 8px; font-size: 12px; border-bottom: 1px solid #1e2a3830; }
  td.label { color: #94a3b8; }
  td.val-a { color: #76b900; font-weight: 600; }
  td.val-b { color: #00b4d8; font-weight: 600; }
  .unit { font-weight: 400; color: #64748b; font-size: 10px; }
  .qa-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .qa-card { background: #0f1117; border-radius: 6px; padding: 14px; border: 1px solid #1e2a38; }
  .qa-card .driver-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; }
  .rating { font-size: 18px; font-weight: 700; }
  .score { font-size: 11px; color: #64748b; margin-top: 2px; }
  .anomaly-row { display: flex; gap: 16px; margin-top: 12px; }
  .anomaly { text-align: center; flex: 1; padding: 6px; border-radius: 4px; background: #141820; }
  .anomaly .count { font-size: 16px; font-weight: 700; }
  .anomaly .alabel { font-size: 9px; text-transform: uppercase; color: #64748b; margin-top: 2px; }
  .high .count { color: #ef4444; }
  .med .count { color: #f59e0b; }
  .low .count { color: #64748b; }
  .warning-item { background: #f59e0b10; border: 1px solid #f59e0b30; border-radius: 4px; padding: 6px 10px; margin-top: 6px; font-size: 11px; color: #fcd34d; }
  .none { color: #64748b; font-size: 11px; }
  .regression-box { padding: 14px; border-radius: 6px; margin-bottom: 16px; }
  .regression-fail { background: #ef444410; border: 1px solid #ef444440; }
  .regression-pass { background: #76b90010; border: 1px solid #76b90040; }
  .regression-summary { font-size: 13px; font-weight: 600; margin-bottom: 8px; }
  .regression-fail .regression-summary { color: #ef4444; }
  .regression-pass .regression-summary { color: #76b900; }
  .delta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px; }
  .delta-card { background: #0f1117; border-radius: 4px; padding: 8px 10px; border: 1px solid #1e2a38; }
  .delta-card .dlabel { font-size: 9px; text-transform: uppercase; color: #64748b; letter-spacing: 0.08em; }
  .delta-card .dval { font-size: 14px; font-weight: 700; margin-top: 2px; }
  .delta-neg { color: #ef4444; }
  .delta-pos { color: #76b900; }
  .delta-neutral { color: #94a3b8; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; margin-left: 10px; vertical-align: middle; }
  .badge-fail { background: #ef444420; color: #ef4444; border: 1px solid #ef444440; }
  .badge-pass { background: #76b90020; color: #76b900; border: 1px solid #76b90040; }
  .footer { margin-top: 28px; padding-top: 16px; border-top: 1px solid #1e2a38; color: #374151; font-size: 10px; display: flex; justify-content: space-between; }
  @media print {
    body { background: #fff; color: #111; }
    .section, .meta-col, .qa-card, .delta-card, .anomaly { background: #f8fafc !important; border-color: #e2e8f0 !important; }
    h1, h2, td.val-a { color: #166534 !important; }
    td.val-b { color: #0369a1 !important; }
    .rating { color: inherit !important; }
  }
</style>
</head>
<body>

<div class="header">
  <h1>FrameBench Analyzer — Performance Report</h1>
  <div class="subtitle">Generated: ${ts} &nbsp;|&nbsp; FrameBench Analyzer v1.0.0</div>
</div>

${(metaA || metaB) ? `
<div class="section">
  <h2>Hardware &amp; Session Metadata</h2>
  <div class="meta-grid">
    ${datasetA ? `
    <div class="meta-col">
      <div class="col-label" style="color:#76b900">Dataset A — ${datasetA.fileName}</div>
      ${gpuA ? `<div class="meta-row"><span class="key">GPU</span><span class="val">${gpuA}</span></div>` : ''}
      ${cpuA ? `<div class="meta-row"><span class="key">CPU</span><span class="val">${cpuA}</span></div>` : ''}
      ${resA ? `<div class="meta-row"><span class="key">Resolution</span><span class="val">${resA}</span></div>` : ''}
      ${appA ? `<div class="meta-row"><span class="key">Application</span><span class="val">${appA}</span></div>` : ''}
      <div class="meta-row"><span class="key">Total Frames</span><span class="val">${datasetA.totalFrameCount.toLocaleString()}</span></div>
    </div>` : ''}
    ${datasetB ? `
    <div class="meta-col">
      <div class="col-label" style="color:#00b4d8">Dataset B — ${datasetB.fileName}</div>
      ${gpuB ? `<div class="meta-row"><span class="key">GPU</span><span class="val">${gpuB}</span></div>` : ''}
      ${cpuB ? `<div class="meta-row"><span class="key">CPU</span><span class="val">${cpuB}</span></div>` : ''}
      ${resB ? `<div class="meta-row"><span class="key">Resolution</span><span class="val">${resB}</span></div>` : ''}
      ${appB ? `<div class="meta-row"><span class="key">Application</span><span class="val">${appB}</span></div>` : ''}
      <div class="meta-row"><span class="key">Total Frames</span><span class="val">${datasetB.totalFrameCount.toLocaleString()}</span></div>
    </div>` : ''}
  </div>
</div>` : ''}

${(metricsA || metricsB) ? `
<div class="section">
  <h2>Performance Metrics Comparison</h2>
  <table>
    <thead>
      <tr>
        <th>Metric</th>
        <th class="val-a">Dataset A</th>
        <th class="val-b">Dataset B</th>
      </tr>
    </thead>
    <tbody>
      ${metricRow('Average FPS', fmtVal(metricsA?.averageFps, 1), fmtVal(metricsB?.averageFps, 1), 'fps')}
      ${metricRow('Average Frame Time', fmtVal(metricsA?.avgFrameTime), fmtVal(metricsB?.avgFrameTime), 'ms')}
      ${metricRow('1% Low FPS', fmtVal(metricsA?.percentile1Low, 1), fmtVal(metricsB?.percentile1Low, 1), 'fps')}
      ${metricRow('0.1% Low FPS', fmtVal(metricsA?.percentile01Low, 1), fmtVal(metricsB?.percentile01Low, 1), 'fps')}
      ${metricRow('Min FPS', fmtVal(metricsA?.minFps, 1), fmtVal(metricsB?.minFps, 1), 'fps')}
      ${metricRow('Max FPS', fmtVal(metricsA?.maxFps, 1), fmtVal(metricsB?.maxFps, 1), 'fps')}
      ${metricRow('Frame Time Variance', fmtVal(metricsA?.frameTimeVariance), fmtVal(metricsB?.frameTimeVariance), 'ms²')}
      ${metricRow('Frame Pacing Stability', fmtVal(metricsA?.framePacingStability, 1), fmtVal(metricsB?.framePacingStability, 1), '%')}
      ${metricRow('Stutter Score', fmtVal(metricsA?.stutterScore), fmtVal(metricsB?.stutterScore), '%')}
    </tbody>
  </table>
</div>` : ''}

${(analysisA || analysisB) ? `
<div class="section">
  <h2>QA Stability Analysis</h2>
  <div class="qa-grid">
    ${analysisA ? `
    <div class="qa-card">
      <div class="driver-label" style="color:#76b900">Dataset A</div>
      <div class="rating" style="color:${colorA}">${ratingA}</div>
      <div class="score">Score: ${analysisA.overallScore} / 100 &nbsp;|&nbsp; ${analysisA.totalFrames.toLocaleString()} frames</div>
      <div class="anomaly-row">
        <div class="anomaly high"><div class="count">${analysisA.anomalyCounts.high}</div><div class="alabel">High</div></div>
        <div class="anomaly med"><div class="count">${analysisA.anomalyCounts.medium}</div><div class="alabel">Medium</div></div>
        <div class="anomaly low"><div class="count">${analysisA.anomalyCounts.low}</div><div class="alabel">Low</div></div>
      </div>
      <div style="margin-top:12px">
        <h3>Instability Warnings</h3>
        ${warningList(analysisA.instabilityWarnings)}
      </div>
    </div>` : ''}
    ${analysisB ? `
    <div class="qa-card">
      <div class="driver-label" style="color:#00b4d8">Dataset B</div>
      <div class="rating" style="color:${colorB}">${ratingB}</div>
      <div class="score">Score: ${analysisB.overallScore} / 100 &nbsp;|&nbsp; ${analysisB.totalFrames.toLocaleString()} frames</div>
      <div class="anomaly-row">
        <div class="anomaly high"><div class="count">${analysisB.anomalyCounts.high}</div><div class="alabel">High</div></div>
        <div class="anomaly med"><div class="count">${analysisB.anomalyCounts.medium}</div><div class="alabel">Medium</div></div>
        <div class="anomaly low"><div class="count">${analysisB.anomalyCounts.low}</div><div class="alabel">Low</div></div>
      </div>
      <div style="margin-top:12px">
        <h3>Instability Warnings</h3>
        ${warningList(analysisB.instabilityWarnings)}
      </div>
    </div>` : ''}
  </div>
</div>` : ''}

${regression ? `
<div class="section">
  <h2>Regression Analysis ${regressionBadge}</h2>
  <div class="regression-box ${regression.isRegressed ? 'regression-fail' : 'regression-pass'}">
    <div class="regression-summary">${regression.summary}</div>
  </div>
  <div class="delta-grid">
    <div class="delta-card">
      <div class="dlabel">FPS Change</div>
      <div class="dval ${regression.fpsChange < -3 ? 'delta-neg' : regression.fpsChange > 3 ? 'delta-pos' : 'delta-neutral'}">
        ${regression.fpsChange >= 0 ? '+' : ''}${regression.fpsChange.toFixed(1)}%
      </div>
    </div>
    <div class="delta-card">
      <div class="dlabel">Variance Change</div>
      <div class="dval ${regression.varianceIncrease ? 'delta-neg' : 'delta-pos'}">
        ${regression.varianceChange >= 0 ? '+' : ''}${regression.varianceChange.toFixed(1)}%
      </div>
    </div>
    <div class="delta-card">
      <div class="dlabel">Stutter Change</div>
      <div class="dval ${regression.stutterIncrease ? 'delta-neg' : 'delta-pos'}">
        ${regression.stutterChange >= 0 ? '+' : ''}${regression.stutterChange.toFixed(2)} pts
      </div>
    </div>
  </div>
</div>` : ''}

<div class="footer">
  <span>FrameBench Analyzer v1.0.0 — Prototype by Vinodh Shekhar</span>
  <span>${ts}</span>
</div>

</body>
</html>`;

  return html;
}

export function generateReport(input: ReportInput): void {
  const html = buildReportHtml(input);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  a.href = url;
  a.download = `framebench-report-${dateStr}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
