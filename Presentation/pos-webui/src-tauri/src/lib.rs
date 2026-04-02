use tauri::{AppHandle, Manager, Listener, Emitter};
use std::time::Duration;
use tokio::time::sleep;
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;

#[derive(Serialize, Deserialize, Debug, sqlx::FromRow)]
struct OfflineTransaction {
    id: String,
    data_json: String,
}

#[derive(sqlx::FromRow)]
struct AuthSession {
    token: String,
}

async fn perform_sync_logic(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let app_dir = app.path().app_data_dir()?;
    let db_path = format!("sqlite:{}/bizflow.db", app_dir.to_string_lossy());
    let pool = SqlitePool::connect(&db_path).await?;

    // 1. Retrieve the Auth Token from SQLite
    let auth_row = sqlx::query_as::<_, AuthSession>(
        "SELECT token FROM auth_session WHERE id = 1 LIMIT 1"
    )
    .fetch_optional(&pool)
    .await?;

    let token = match auth_row {
        Some(session) => session.token,
        None => {
            eprintln!("[Sync Worker] No auth token found. Skipping sync.");
            return Ok(());
        }
    };

    // 2. Fetch Pending Transactions
    let rows = sqlx::query_as::<_, OfflineTransaction>(
        "SELECT id, data_json FROM offline_transactions 
         WHERE status IN ('pending', 'failed') 
         ORDER BY created_at ASC LIMIT 10"
    )
    .fetch_all(&pool)
    .await?;

    if rows.is_empty() {
        return Ok(());
    }

    let client = reqwest::Client::new();
    let api_url = "http://localhost:5130/api/Transactions/checkout";

    for row in rows {
        let payload: serde_json::Value = serde_json::from_str(&row.data_json)?;

        // 3. Send POST with Authorization Header
        let response = client
            .post(api_url)
            .header("Authorization", format!("Bearer {}", token))
            .header("X-Offline-Sync", "true")
            .header("X-Local-Id", &row.id)
            .json(&payload)
            .timeout(Duration::from_secs(10))
            .send()
            .await;

        match response {
            Ok(res) if res.status().is_success() => {
                sqlx::query(
                    "UPDATE offline_transactions 
                     SET status = 'synced', synced_at = CURRENT_TIMESTAMP 
                     WHERE id = ?"
                )
                .bind(&row.id)
                .execute(&pool)
                .await?;
                
                let _ = app.emit("sync:item-complete", &row.id);
                println!("[Sync Worker] Successfully synced: {}", row.id);
            }
            Ok(res) => {
                let err_msg = format!("Server Error: {}", res.status());
                sqlx::query(
                    "UPDATE offline_transactions SET last_error = ?, status = 'failed' WHERE id = ?"
                )
                .bind(err_msg)
                .bind(&row.id)
                .execute(&pool)
                .await?;
                
                // Stop processing if unauthorized or validation failed to keep order
                break;
            }
            Err(e) => {
                eprintln!("[Sync Worker] Connectivity issue: {}", e);
                break; 
            }
        }
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let app_handle = app.handle().clone();

            app.listen("sync:trigger", move |_| {
                let handle = app_handle.clone();
                tauri::async_runtime::spawn(async move {
                    if let Err(e) = perform_sync_logic(&handle).await {
                        eprintln!("[Sync Worker] Manual trigger error: {}", e);
                    }
                });
            });

            let app_handle_loop = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                loop {
                    sleep(Duration::from_secs(60)).await;
                    let _ = perform_sync_logic(&app_handle_loop).await;
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}