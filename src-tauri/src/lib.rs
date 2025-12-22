mod api_server;
mod hardware;
mod kernel;
mod scripting;

use crate::api_server::{start_server, ApiState};
use crate::hardware::{HardwareManager, HardwareMetrics};
use crate::kernel::{KernelManager, KernelState};
use crate::scripting::ScriptEngine;
use std::sync::Arc;
use tauri::State;
use tokio::sync::Mutex as AsyncMutex;

struct AppState {
    hardware: Arc<HardwareManager>,
    kernel: Arc<KernelManager>,
    script_engine: Arc<ScriptEngine>,
    api_server_task: AsyncMutex<Option<tokio::task::JoinHandle<()>>>,
}

#[tauri::command]
async fn toggle_api_server(state: State<'_, AppState>, enable: bool) -> Result<u16, String> {
    let mut task_lock = state.api_server_task.lock().await;

    if enable {
        if task_lock.is_some() {
            return Ok(4242); // Already running
        }

        let api_state = ApiState {
            hardware: state.hardware.clone(),
            kernel: state.kernel.clone(),
            script_engine: state.script_engine.clone(),
        };

        let handle = tokio::spawn(async move {
            if let Err(e) = start_server(4242, api_state).await {
                eprintln!("API Server Error: {}", e);
            }
        });

        *task_lock = Some(handle);
        Ok(4242)
    } else {
        if let Some(handle) = task_lock.take() {
            handle.abort();
        }
        Ok(0)
    }
}

#[tauri::command]
fn get_hardware_metrics(state: State<'_, AppState>) -> HardwareMetrics {
    state.inner().hardware.get_metrics()
}

#[tauri::command]
fn get_kernel_state(state: State<'_, AppState>) -> KernelState {
    state.inner().kernel.get_state()
}

#[tauri::command]
fn run_script(state: State<'_, AppState>, script: String) -> Result<(), String> {
    state
        .inner()
        .script_engine
        .run(&script)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn toggle_kernel(state: State<'_, AppState>) {
    let kernel = &state.inner().kernel;
    let current = kernel.get_state().is_running;
    if current {
        kernel.stop();
    } else {
        kernel.start();
    }
}

#[tauri::command]
fn start_recording(state: State<'_, AppState>) {
    state.inner().hardware.start_recording();
}

#[tauri::command]
fn stop_recording(state: State<'_, AppState>) -> Vec<HardwareMetrics> {
    state.inner().hardware.stop_recording()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let hardware = Arc::new(HardwareManager::new());
    let kernel = Arc::new(KernelManager::new());
    let script_engine = Arc::new(ScriptEngine::new(hardware.clone(), kernel.clone()));

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            hardware,
            kernel,
            script_engine,
            api_server_task: AsyncMutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            get_hardware_metrics,
            get_kernel_state,
            run_script,
            toggle_kernel,
            start_recording,
            stop_recording,
            toggle_api_server
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
