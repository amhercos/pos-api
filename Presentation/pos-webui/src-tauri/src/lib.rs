
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // We keep the log plugin for debugging, but remove the SQL plugin
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            println!("[BizFlow] initialized. .NET Sidecar managing the DB.");

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}