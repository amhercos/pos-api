use tauri::Manager;
use tauri_plugin_shell::ShellExt;
use std::path::PathBuf;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // --- THE CORRECT DYNAMIC PATH RESOLUTION ---
            let sidecar_dir = if cfg!(debug_assertions) {
                // In Dev: Cargo knows exactly where your source code is
                PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("binaries")
            } else {
                // In Prod: Use the standard resources folder
                app.path().resource_dir().unwrap().join("binaries")
            };

            println!("[BizFlow] Working Directory: {:?}", sidecar_dir);

            let sidecar_command = app
                .shell()
                .sidecar("BizFlow.Backend")
                .expect("Failed to create sidecar command")
                .current_dir(sidecar_dir);

            let (mut rx, _child) = sidecar_command
                .spawn()
                .expect("Failed to spawn .NET sidecar");

            tauri::async_runtime::spawn(async move {
                use tauri_plugin_shell::process::CommandEvent;
                while let Some(event) = rx.recv().await {
                    match event {
                        CommandEvent::Stdout(line) => {
                            println!("[Backend]: {}", String::from_utf8_lossy(&line).trim());
                        }
                        CommandEvent::Stderr(line) => {
                            eprintln!("[Backend-ERROR]: {}", String::from_utf8_lossy(&line).trim());
                        }
                        _ => (),
                    }
                }
            });

            println!("[BizFlow] .NET Sidecar initialization complete.");

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}