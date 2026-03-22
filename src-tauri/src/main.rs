// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  // Set WebView2 remote debug port before the runtime is created (debug builds only)
  #[cfg(debug_assertions)]
  std::env::set_var(
    "WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS",
    "--remote-debugging-port=9222",
  );

  app_lib::run();
}
