mod commands;
pub use commands::*;
// GPU_TELEMETRY_DISABLED:
// use std::collections::VecDeque;
// use std::sync::{Arc, Mutex};
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
                // Auto-open devtools panel for inspection
                if let Some(win) = app.get_webview_window("main") {
                    let _ = win.open_devtools();
                }
            }

            // ── System tray ──────────────────────────────────────────────
            use tauri::menu::{Menu, MenuItem};
            use tauri::tray::TrayIconBuilder;
            let show = MenuItem::with_id(app, "show_hide", "Show / Hide", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &quit])?;
            let tray = TrayIconBuilder::new()
                .icon(tauri::include_image!("icons/icon.ico"))
                .tooltip("FrameBench Analyzer")
                .menu(&menu)
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "quit" => app.exit(0),
                    "show_hide" => {
                        if let Some(w) = app.get_webview_window("main") {
                            if w.is_visible().unwrap_or(false) {
                                let _ = w.hide();
                            } else {
                                let _ = w.show();
                                let _ = w.set_focus();
                            }
                        }
                    }
                    _ => {}
                })
                .build(app)?;

            app.manage(tray); // keep tray alive

            /* GPU_TELEMETRY_DISABLED — comment back in to re-enable GPU polling
            // ── GPU history polling ───────────────────────────────────────
            // Register the history buffer as managed state first
            let buf: Arc<Mutex<VecDeque<GpuSnapshot>>> =
                Arc::new(Mutex::new(VecDeque::with_capacity(120)));
            app.manage(GpuHistoryState(buf.clone()));

            // Clone tray handle so the polling task can update the tooltip
            let tray_for_task = tray.clone();

            tauri::async_runtime::spawn(async move {
                loop {
                    // Run nvidia-smi in a blocking thread so we don't stall the async runtime
                    let buf_clone = buf.clone();
                    let tray_clone = tray_for_task.clone();
                    tauri::async_runtime::spawn_blocking(move || {
                        use std::process::Command as SysCommand;
                        use std::time::{SystemTime, UNIX_EPOCH};

                        let result = SysCommand::new("nvidia-smi")
                            .args([
                                "--query-gpu=temperature.gpu,power.draw,clocks.current.graphics,utilization.gpu",
                                "--format=csv,noheader,nounits",
                            ])
                            .output();

                        if let Ok(o) = result {
                            if o.status.success() {
                                let stdout = String::from_utf8_lossy(&o.stdout);
                                let line = stdout.lines().next().unwrap_or("").trim();
                                let parts: Vec<&str> =
                                    line.split(',').map(|s| s.trim()).collect();
                                if parts.len() >= 4 {
                                    let temp: f32 = parts[0].parse().unwrap_or(0.0);
                                    let power: f32 = parts[1].parse().unwrap_or(0.0);
                                    let core_clk: u32 = parts[2].parse().unwrap_or(0);
                                    let util: u32 = parts[3].parse().unwrap_or(0);
                                    let ts = SystemTime::now()
                                        .duration_since(UNIX_EPOCH)
                                        .unwrap_or_default()
                                        .as_secs();

                                    let snapshot = GpuSnapshot {
                                        timestamp_secs: ts,
                                        temperature: temp,
                                        power_draw: power,
                                        core_clock_mhz: core_clk,
                                        gpu_utilization: util,
                                    };

                                    let mut guard = buf_clone.lock().unwrap();
                                    if guard.len() >= 120 {
                                        guard.pop_front();
                                    }
                                    guard.push_back(snapshot);

                                    // Update tray tooltip with live GPU temp
                                    let _ = tray_clone.set_tooltip(Some(&format!(
                                        "FrameBench Analyzer | GPU {}°C  {}W",
                                        temp as u32, power as u32
                                    )));
                                }
                            }
                        }
                    })
                    .await
                    .ok();

                    tokio::time::sleep(std::time::Duration::from_secs(3)).await;
                }
            });
            */ // end GPU_TELEMETRY_DISABLED

            Ok(())
        })
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        // .plugin(tauri_plugin_notification::init()) // PHASE2_DISABLED
        .invoke_handler(tauri::generate_handler![
            // commands::get_gpu_stats,  // GPU_TELEMETRY_DISABLED
            commands::get_app_info,
            commands::save_report,
            // commands::get_gpu_history, // GPU_TELEMETRY_DISABLED
            // commands::show_notification // PHASE2_DISABLED
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
