use crate::hardware::{HardwareManager, HardwareMetrics};
use crate::kernel::{KernelManager, KernelState};
use crate::scripting::ScriptEngine;
use axum::{
    extract::State,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Clone)]
pub struct ApiState {
    pub hardware: Arc<HardwareManager>,
    pub kernel: Arc<KernelManager>,
    pub script_engine: Arc<ScriptEngine>,
}

#[derive(Serialize, Deserialize)]
pub struct ScriptRequest {
    pub script: String,
}

#[derive(Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: T,
}

pub async fn start_server(port: u16, state: ApiState) -> Result<(), String> {
    let app = Router::new()
        .route("/metrics", get(get_metrics))
        .route("/kernel/state", get(get_kernel_state))
        .route("/kernel/toggle", post(toggle_kernel))
        .route("/script/run", post(run_script))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind(format!("127.0.0.1:{}", port))
        .await
        .map_err(|e| e.to_string())?;

    axum::serve(listener, app).await.map_err(|e| e.to_string())
}

async fn get_metrics(State(state): State<ApiState>) -> Json<HardwareMetrics> {
    Json(state.hardware.get_metrics())
}

async fn get_kernel_state(State(state): State<ApiState>) -> Json<KernelState> {
    Json(state.kernel.get_state())
}

async fn toggle_kernel(State(state): State<ApiState>) -> Json<bool> {
    let current = state.kernel.get_state().is_running;
    if current {
        state.kernel.stop();
    } else {
        state.kernel.start();
    }
    Json(!current)
}

async fn run_script(
    State(state): State<ApiState>,
    Json(req): Json<ScriptRequest>,
) -> Json<ApiResponse<String>> {
    match state.script_engine.run(&req.script) {
        Ok(_) => Json(ApiResponse {
            success: true,
            data: "Script executed successfully".into(),
        }),
        Err(e) => Json(ApiResponse {
            success: false,
            data: e.to_string(),
        }),
    }
}
