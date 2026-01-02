import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

interface SimulatorState {
    isKernelRunning: boolean;
    isDisplayOn: boolean;
    isCameraOn: boolean;
    cpuLoad: number;
    temperature: number;
    batteryLevel: number;
    rotation: [number, number, number];
    apiServerPort: number;

    toggleKernel: () => Promise<void>;
    toggleDisplay: () => void;
    toggleCamera: () => void;
    syncWithBackend: () => Promise<void>;
    setRotation: (rotation: [number, number, number]) => void;
    toggleApiServer: (enable: boolean) => Promise<void>;
}

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
    isKernelRunning: false,
    isDisplayOn: true,
    isCameraOn: false,
    cpuLoad: 0,
    temperature: 25,
    batteryLevel: 100,
    rotation: [0, 0, 0],
    apiServerPort: 0,

    toggleKernel: async () => {
        try {
            await invoke('toggle_kernel');
            await get().syncWithBackend();
        } catch (e) {
            console.error("Kernel toggle failed", e);
        }
    },

    toggleDisplay: async () => {
        try {
            await invoke('toggle_display');
            await get().syncWithBackend();
        } catch (e) {
            console.error("Display toggle failed", e);
        }
    },

    toggleCamera: () => {
        set((state) => ({ isCameraOn: !state.isCameraOn }));
    },

    syncWithBackend: async () => {
        try {
            const metrics: any = await invoke('get_hardware_metrics');
            const kernel: any = await invoke('get_kernel_state');

            set({
                cpuLoad: metrics.cpu_load,
                temperature: metrics.temperature,
                batteryLevel: metrics.battery_level,
                isKernelRunning: kernel.is_running,
                rotation: metrics.rotation,
                isDisplayOn: metrics.display_on
            });
        } catch (e) {
            // Silently fail or log sparingly to avoid log bloat during sync
            if (Math.random() < 0.01) console.error("Sync heartbeat failed");
        }
    },

    setRotation: (rotation) => set({ rotation }),

    toggleApiServer: async (enable: boolean) => {
        try {
            const port = await invoke<number>('toggle_api_server', { enable });
            set({ apiServerPort: port });
        } catch (e) {
            console.error("API Server toggle failed", e);
        }
    },
}));
