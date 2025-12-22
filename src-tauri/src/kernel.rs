use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LogEntry {
    pub timestamp: String,
    pub level: String,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct KernelState {
    pub is_running: bool,
    pub uptime: u64,
    pub processes: Vec<String>,
    pub logs: Vec<LogEntry>,
}

pub struct KernelManager {
    pub state: Mutex<KernelState>,
}

impl KernelManager {
    pub fn new() -> Self {
        Self {
            state: Mutex::new(KernelState {
                is_running: false,
                uptime: 0,
                processes: vec![],
                logs: vec![],
            }),
        }
    }

    pub fn log(&self, level: &str, message: &str) {
        let mut s = self.state.lock().unwrap();
        s.logs.push(LogEntry {
            timestamp: Utc::now().to_rfc3339(),
            level: level.to_string(),
            message: message.to_string(),
        });
        if s.logs.len() > 100 {
            s.logs.remove(0);
        }
    }

    pub fn start(&self) {
        let mut s = self.state.lock().unwrap();
        s.is_running = true;
        drop(s);
        self.log("INFO", "Clarigggz Kernel Initialized");
    }

    pub fn stop(&self) {
        let mut s = self.state.lock().unwrap();
        s.is_running = false;
        drop(s);
        self.log("WARN", "Clarigggz Kernel Halted");
    }

    pub fn get_state(&self) -> KernelState {
        self.state.lock().unwrap().clone()
    }
}
