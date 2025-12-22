import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

interface SimulatorState {
    isKernelRunning: boolean;
    isDisplayOn: boolean;
    cpuLoad: number;
    temperature: number;
    batteryLevel: number;
    rotation: [number, number, number];

    toggleKernel: () => Promise<void>;
    toggleDisplay: () => void;
    syncWithBackend: () => Promise<void>;
    setRotation: (rotation: [number, number, number]) => void;
}

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
    isKernelRunning: false,
    isDisplayOn: true,
    cpuLoad: 0,
    temperature: 25,
    batteryLevel: 100,
    rotation: [0, 0, 0],

    toggleKernel: async () => {
        await invoke('toggle_kernel');
        await get().syncWithBackend();
    },

    toggleDisplay: () => set((state) => ({ isDisplayOn: !state.isDisplayOn })),

    syncWithBackend: async () => {
        try {
            const metrics: any = await invoke('get_hardware_metrics');
            const kernel: any = await invoke('get_kernel_state');

            set({
                cpuLoad: metrics.cpu_load,
                temperature: metrics.temperature,
                batteryLevel: metrics.battery_level,
                isKernelRunning: kernel.is_running,
                rotation: metrics.rotation
            });
        } catch (e) {
            console.error("Backend sync failed", e);
        }
    },

    setRotation: (rotation) => set({ rotation }),
}));

