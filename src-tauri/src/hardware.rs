use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct HardwareMetrics {
    pub cpu_load: f32,
    pub temperature: f32,
    pub battery_level: f32,
    pub rotation: [f32; 3],
    pub acceleration: [f32; 3],
    pub display_on: bool,
}

pub struct HardwareManager {
    pub metrics: Mutex<HardwareMetrics>,
    pub recording: Mutex<bool>,
    pub history: Mutex<Vec<HardwareMetrics>>,
}

impl HardwareManager {
    pub fn new() -> Self {
        Self {
            metrics: Mutex::new(HardwareMetrics {
                cpu_load: 0.0,
                temperature: 25.0,
                battery_level: 100.0,
                rotation: [0.0, 0.0, 0.0],
                acceleration: [0.0, 0.0, 0.0],
                display_on: true,
            }),
            recording: Mutex::new(false),
            history: Mutex::new(vec![]),
        }
    }

    pub fn toggle_display(&self) -> bool {
        let mut m = self.metrics.lock().unwrap();
        m.display_on = !m.display_on;
        m.display_on
    }

    pub fn update_rotation(&self, x: f32, y: f32, z: f32) {
        let mut m = self.metrics.lock().unwrap();
        m.rotation = [x, y, z];
        if *self.recording.lock().unwrap() {
            self.history.lock().unwrap().push(m.clone());
        }
    }

    pub fn start_recording(&self) {
        let mut h = self.history.lock().unwrap();
        h.clear();
        *self.recording.lock().unwrap() = true;
    }

    pub fn stop_recording(&self) -> Vec<HardwareMetrics> {
        *self.recording.lock().unwrap() = false;
        self.history.lock().unwrap().clone()
    }

    pub fn get_metrics(&self) -> HardwareMetrics {
        self.metrics.lock().unwrap().clone()
    }
}
