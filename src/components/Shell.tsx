import React, { useState, useEffect } from 'react';
import { Layers, Settings, Play, Box, Terminal as TerminalIcon, Cpu, Glasses, Monitor, Square } from 'lucide-react';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { ScriptTerminal } from './Terminal';
import { Scene } from '../simulator/Scene';

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick?: () => void;
}

const SidebarItem = ({ icon, label, active, onClick }: SidebarItemProps) => (
    <div className={`sidebar-item ${active ? 'active' : ''}`} onClick={onClick}>
        {icon}
        <span className="sidebar-item-label">{label}</span>
    </div>
);

export function Shell({ children }: { children: React.ReactNode }) {
    const [activeTab, setActiveTab] = useState<'simulator' | 'console'>('simulator');
    const {
        isKernelRunning,
        toggleKernel,
        isDisplayOn,
        toggleDisplay,
        cpuLoad,
        temperature,
        rotation,
        batteryLevel,
        syncWithBackend
    } = useSimulatorStore();

    useEffect(() => {
        const interval = setInterval(() => {
            syncWithBackend();
        }, 1000);
        return () => clearInterval(interval);
    }, [syncWithBackend]);

    return (
        <div className="shell-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <Glasses size={24} color="white" />
                </div>

                <div style={{ width: '100%' }}>
                    <SidebarItem
                        icon={<Box size={20} />}
                        label="Simulator"
                        active={activeTab === 'simulator'}
                        onClick={() => setActiveTab('simulator')}
                    />
                    <SidebarItem
                        icon={<TerminalIcon size={20} />}
                        label="OS Console"
                        active={activeTab === 'console'}
                        onClick={() => setActiveTab('console')}
                    />
                    <SidebarItem icon={<Cpu size={20} />} label="Hardware" />
                    <SidebarItem icon={<Layers size={20} />} label="Assets" />
                </div>

                <div style={{ marginTop: 'auto', width: '100%' }}>
                    <SidebarItem icon={<Settings size={20} />} label="Settings" />
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-area">
                {/* Top Header */}
                <header className="top-header">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h1 className="header-title">
                            Clarigggz <span className="header-accent">Simulator</span>
                        </h1>
                        <div className="badge-live"
                            style={{
                                background: isKernelRunning ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: isKernelRunning ? '#10b981' : '#ef4444',
                                borderColor: isKernelRunning ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                            }}>
                            {isKernelRunning ? 'Live' : 'Stopped'}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            className="btn-primary"
                            onClick={toggleKernel}
                            style={{ color: isKernelRunning ? '#ef4444' : '#10b981' }}
                        >
                            {isKernelRunning ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                            {isKernelRunning ? 'Stop Kernel' : 'Start Kernel'}
                        </button>
                        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
                        <button
                            className="btn-primary"
                            onClick={toggleDisplay}
                            style={{ padding: '8px', color: isDisplayOn ? 'var(--accent-cyan)' : 'var(--text-muted)' }}
                        >
                            <Monitor size={18} />
                        </button>
                    </div>
                </header>

                {/* Workspace */}
                <div className="workspace">
                    {activeTab === 'simulator' ? children : <ScriptTerminal />}
                </div>

                {/* Bottom Status Bar */}
                <footer className="status-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div className="status-indicator" style={{
                                background: isKernelRunning ? 'var(--accent-cyan)' : '#ef4444',
                                boxShadow: isKernelRunning ? '0 0 8px var(--accent-cyan)' : 'none'
                            }} />
                            ClarigggzKernel v0.4.2-alpha
                        </div>
                        <span>FPS: 60.0</span>
                        <span>Uptime: {isKernelRunning ? 'Running' : 'Offline'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <div style={{
                                width: '12px', height: '6px', border: '1px solid currentColor',
                                borderRadius: '1px', position: 'relative'
                            }}>
                                <div style={{
                                    width: `${batteryLevel}%`, height: '100%',
                                    background: 'currentColor', transition: 'width 0.3s'
                                }} />
                            </div>
                            <span>{batteryLevel}%</span>
                        </div>
                        <span>XYZ: {rotation[0].toFixed(1)}, {rotation[1].toFixed(1)}, {rotation[2].toFixed(1)}</span>
                    </div>
                </footer>
            </main>

            {/* Right Panel/Inspector */}
            <aside className="right-panel">
                <div className="inspector-header">
                    <h3 className="inspector-title">State Inspector</h3>
                </div>
                <div className="inspector-content">
                    <div className="metric-card">
                        <span className="metric-label">Power & Thermal</span>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                            <div>
                                <span className="metric-label">CORE LOAD</span>
                                <span className="metric-value" style={{ color: 'var(--accent-cyan)' }}>
                                    {isKernelRunning ? `${cpuLoad.toFixed(1)}%` : '0.0%'}
                                </span>
                            </div>
                            <div>
                                <span className="metric-label">SoC TEMP</span>
                                <span className="metric-value" style={{ color: temperature > 60 ? '#ef4444' : '#fb923c' }}>
                                    {isKernelRunning ? `${temperature.toFixed(1)}°C` : '24.0°C'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="metric-card">
                        <span className="metric-label">Inertial Measurement Unit</span>
                        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Pitch:</span> <span>{rotation[0].toFixed(3)}°</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Yaw:</span> <span>{rotation[1].toFixed(3)}°</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Roll:</span> <span>{rotation[2].toFixed(3)}°</span>
                            </div>
                        </div>
                    </div>

                    <div className="metric-card">
                        <span className="metric-label">Active Processes</span>
                        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {!isKernelRunning ? (
                                <span className="text-[10px] text-gray-600 italic">Kernel offline</span>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] text-emerald-400">spatial_engine</span>
                                        <span className="text-[10px] text-gray-500 font-mono">PID 412</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] text-emerald-400">gesture_svc</span>
                                        <span className="text-[10px] text-gray-500 font-mono">PID 415</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}
