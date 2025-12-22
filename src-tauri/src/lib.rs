mod hardware;
mod kernel;
mod scripting;

use crate::hardware::{HardwareManager, HardwareMetrics};
use crate::kernel::{KernelManager, KernelState};
use crate::scripting::ScriptEngine;
use std::sync::Arc;
use tauri::State;

struct AppState {
    hardware: Arc<HardwareManager>,
    kernel: Arc<KernelManager>,
    script_engine: ScriptEngine,
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
    let script_engine = ScriptEngine::new(hardware.clone(), kernel.clone());

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            hardware,
            kernel,
            script_engine,
        })
        .invoke_handler(tauri::generate_handler![
            get_hardware_metrics,
            get_kernel_state,
            run_script,
            toggle_kernel,
            start_recording,
            stop_recording
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
