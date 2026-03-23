/* GPU_TELEMETRY_DISABLED — uncomment to re-enable GPU telemetry commands
use std::process::Command as SysCommand;
use std::collections::VecDeque;
use std::sync::{Arc, Mutex};

#[derive(serde::Serialize, Clone)]
pub struct GpuStats {
    pub name: String,
    pub temperature: f32,
    pub power_draw: f32,
    pub vram_used_mb: u64,
    pub vram_total_mb: u64,
    pub fan_percent: u32,
    pub gpu_utilization: u32,
    pub core_clock_mhz: u32,
    pub mem_clock_mhz: u32,
    pub pstate: String,
    pub available: bool,
}

/// Query NVIDIA GPU stats via nvidia-smi.
/// Returns a GpuStats with available=false if nvidia-smi is not present or fails.
#[tauri::command]
pub fn get_gpu_stats() -> GpuStats {
    let result = SysCommand::new("nvidia-smi")
        .args([
            "--query-gpu=name,temperature.gpu,power.draw,memory.used,memory.total,fan.speed,utilization.gpu,clocks.current.graphics,clocks.current.memory,pstate",
            "--format=csv,noheader,nounits",
        ])
        .output();

    let output = match result {
        Ok(o) if o.status.success() => o,
        _ => return unavailable_stats(),
    };

    let stdout = String::from_utf8_lossy(&output.stdout);
    // nvidia-smi can return multiple GPUs — use the first line
    let line = stdout.lines().next().unwrap_or("").trim();
    let parts: Vec<&str> = line.split(',').map(|s| s.trim()).collect();

    if parts.len() < 10 {
        return unavailable_stats();
    }

    GpuStats {
        name: parts[0].to_string(),
        temperature: parts[1].parse().unwrap_or(0.0),
        power_draw: parts[2].parse().unwrap_or(0.0),
        vram_used_mb: parts[3].parse().unwrap_or(0),
        vram_total_mb: parts[4].parse().unwrap_or(0),
        fan_percent: parts[5].parse().unwrap_or(0),
        gpu_utilization: parts[6].parse().unwrap_or(0),
        core_clock_mhz: parts[7].parse().unwrap_or(0),
        mem_clock_mhz: parts[8].parse().unwrap_or(0),
        pstate: parts[9].to_string(),
        available: true,
    }
}

fn unavailable_stats() -> GpuStats {
    GpuStats {
        name: String::new(),
        temperature: 0.0,
        power_draw: 0.0,
        vram_used_mb: 0,
        vram_total_mb: 0,
        fan_percent: 0,
        gpu_utilization: 0,
        core_clock_mhz: 0,
        mem_clock_mhz: 0,
        pstate: String::new(),
        available: false,
    }
}

/// A single GPU telemetry snapshot stored in the rolling history buffer.
#[derive(serde::Serialize, Clone)]
pub struct GpuSnapshot {
    pub timestamp_secs: u64,
    pub temperature: f32,
    pub power_draw: f32,
    pub core_clock_mhz: u32,
    pub gpu_utilization: u32,
}

/// Managed state holding the circular GPU history buffer.
pub struct GpuHistoryState(pub Arc<Mutex<VecDeque<GpuSnapshot>>>);

/// Query the current rolling GPU telemetry history (up to 120 samples, one per 3 s).
#[tauri::command]
pub fn get_gpu_history(state: tauri::State<GpuHistoryState>) -> Vec<GpuSnapshot> {
    state.0.lock().unwrap().iter().cloned().collect()
}
*/ // end GPU_TELEMETRY_DISABLED

/// Save an HTML report to a user-chosen path via native Save As dialog.
#[tauri::command]
pub async fn save_report(app: tauri::AppHandle, html: String) -> Result<String, String> {
    use tauri_plugin_dialog::DialogExt;

    let path = app
        .dialog()
        .file()
        .set_title("Save FrameBench Report")
        .add_filter("HTML Report", &["html"])
        .set_file_name("framebench-report.html")
        .blocking_save_file();

    match path {
        Some(fp) => {
            let pb = fp.into_path().map_err(|e| format!("{e}"))?;
            std::fs::write(&pb, html.as_bytes()).map_err(|e| e.to_string())?;
            Ok(pb.display().to_string())
        }
        None => Err("Cancelled".to_string()),
    }
}

/* PHASE2_DISABLED — uncomment to re-enable toast notifications
/// Show a native Windows toast notification.
#[tauri::command]
pub fn show_notification(app: tauri::AppHandle, title: String, body: String) -> Result<(), String> {
    use tauri_plugin_notification::NotificationExt;
    app.notification()
        .builder()
        .title(&title)
        .body(&body)
        .show()
        .map_err(|e| e.to_string())
}
*/ // end PHASE2_DISABLED

#[derive(serde::Serialize)]
pub struct AppInfo {
    pub version: String,
    pub tauri_version: String,
}

#[tauri::command]
pub fn get_app_info() -> AppInfo {
    AppInfo {
        version: env!("CARGO_PKG_VERSION").to_string(),
        tauri_version: tauri::VERSION.to_string(),
    }
}
