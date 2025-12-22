use crate::hardware::HardwareManager;
use crate::kernel::KernelManager;
use rhai::{Engine, Scope};
use std::sync::Arc;

pub struct ScriptEngine {
    engine: Engine,
}

impl ScriptEngine {
    pub fn new(hardware: Arc<HardwareManager>, kernel: Arc<KernelManager>) -> Self {
        let mut engine = Engine::new();

        let hw = hardware.clone();
        engine.register_fn("set_rotation", move |x: f32, y: f32, z: f32| {
            hw.update_rotation(x, y, z);
        });

        let kn = kernel.clone();
        engine.register_fn("log", move |msg: &str| {
            kn.log("SCRIPT", msg);
        });

        let kn2 = kernel.clone();
        engine.register_fn("kernel_start", move || {
            kn2.start();
        });

        let kn3 = kernel;
        engine.register_fn("kernel_stop", move || {
            kn3.stop();
        });

        Self { engine }
    }

    pub fn run(&self, script: &str) -> Result<(), Box<rhai::EvalAltResult>> {
        let mut scope = Scope::new();
        self.engine.run_with_scope(&mut scope, script)?;
        Ok(())
    }
}
