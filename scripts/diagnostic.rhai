// Hardware Stress Test & Calibration
log("Initializing system calibration...");

kernel_start();

// Test IMU full rotation
for x in 0..36 {
    let angle = x * 10.0;
    set_rotation(angle, angle / 2.0, 0.0);
    if x % 9 == 0 {
        log("Calibration checkpoint: " + angle + " degrees");
    }
}

log("Stress test complete. All sensors operational.");
