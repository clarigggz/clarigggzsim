import React, { useState, useEffect } from 'react';
import { Settings, Play, Box, Terminal as TerminalIcon, Glasses, Monitor, Square, Activity, Database, Zap } from 'lucide-react';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { ScriptTerminal } from './Terminal';

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
    const [isStoreReady, setIsStoreReady] = useState(false);
    const store = useSimulatorStore();

    useEffect(() => {
        setIsStoreReady(true);
        const interval = setInterval(() => {
            store.syncWithBackend();
        }, 1000);
        return () => clearInterval(interval);
    }, [store.syncWithBackend]);

    if (!isStoreReady) {
        return <div style={{ background: '#000', color: '#00f2ff', padding: '20px', fontFamily: 'monospace' }}>Initializing Spatial Store...</div>;
    }

    return (
        <div className="shell-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <Glasses size={22} color="white" />
                </div>

                <div style={{ width: '100%', flex: 1 }}>
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
                    <SidebarItem icon={<Activity size={20} />} label="Metrics" />
                    <SidebarItem icon={<Database size={20} />} label="Assets" />
                </div>

                <div style={{ width: '100%' }}>
                    <SidebarItem icon={<Settings size={20} />} label="Settings" />
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-area">
                {/* Top Header */}
                <header className="top-header">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h1 className="header-title">
                            Clarigggz <span className="header-accent">Spatial Simulator</span>
                        </h1>
                        <div className={`badge-live ${store.isKernelRunning ? 'live' : 'stopped'}`}
                            style={{
                                background: store.isKernelRunning ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: store.isKernelRunning ? '#10b981' : '#ef4444',
                                border: '1px solid currentColor',
                                padding: '2px 8px',
                                borderRadius: '100px',
                                fontSize: '10px',
                                marginLeft: '12px',
                                textTransform: 'uppercase'
                            }}>
                            {store.isKernelRunning ? 'Kernel Live' : 'Kernel Stopped'}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            className="btn-primary"
                            onClick={store.toggleKernel}
                            style={{
                                color: store.isKernelRunning ? '#ef4444' : '#10b981',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 16px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '4px'
                            }}
                        >
                            {store.isKernelRunning ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                            {store.isKernelRunning ? 'Shut Down' : 'Boot Kernel'}
                        </button>
                        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
                        <button
                            className="btn-primary"
                            onClick={store.toggleDisplay}
                            style={{
                                padding: '8px',
                                color: store.isDisplayOn ? 'var(--accent-cyan)' : 'var(--text-muted)',
                                background: 'transparent',
                                border: 'none'
                            }}
                        >
                            <Monitor size={18} />
                        </button>
                    </div>
                </header>

                {/* Workspace */}
                <div className="workspace">
                    {activeTab === 'simulator' ? (
                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                            {children}
                            {!store.isDisplayOn && (
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', zIndex: 5, color: 'var(--text-muted)'
                                }}>
                                    DISPLAY OFFLINE
                                </div>
                            )}
                        </div>
                    ) : <ScriptTerminal />}
                </div>

                {/* Bottom Status Bar */}
                <footer className="status-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div className="status-indicator" style={{
                                background: store.isKernelRunning ? 'var(--accent-cyan)' : '#ef4444',
                                boxShadow: store.isKernelRunning ? '0 0 8px var(--accent-cyan)' : 'none'
                            }} />
                            ClarigggzKernel v0.4.2-alpha
                        </div>
                        <span>FPS: 60.0</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <Zap size={12} color={store.batteryLevel < 20 ? '#ef4444' : 'var(--accent-emerald)'} />
                            <div style={{
                                width: '24px', height: '10px', border: '1px solid currentColor',
                                borderRadius: '2px', position: 'relative', overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${store.batteryLevel}%`, height: '100%',
                                    background: store.batteryLevel < 20 ? '#ef4444' : 'var(--accent-emerald)', transition: 'width 0.3s'
                                }} />
                            </div>
                            <span>{store.batteryLevel}%</span>
                        </div>
                        <span>XYZ: {store.rotation[0].toFixed(1)}, {store.rotation[1].toFixed(1)}, {store.rotation[2].toFixed(1)}</span>
                    </div>
                </footer>
            </main>

            {/* Right Panel/Inspector */}
            <aside className="right-panel">
                <div className="inspector-header">
                    <h3 className="inspector-title">Environment Inspector</h3>
                </div>
                <div className="inspector-content">
                    <div className="metric-card">
                        <span className="metric-label">Node Status</span>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                            <div>
                                <span className="metric-label">CPU LOAD</span>
                                <span className="metric-value" style={{ color: 'var(--accent-cyan)' }}>
                                    {store.isKernelRunning ? `${store.cpuLoad.toFixed(1)}%` : '0.0%'}
                                </span>
                            </div>
                            <div>
                                <span className="metric-label">TEMP</span>
                                <span className="metric-value" style={{ color: store.temperature > 60 ? '#ef4444' : '#fb923c' }}>
                                    {store.isKernelRunning ? `${store.temperature.toFixed(1)}°C` : '24.2°C'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="metric-card">
                        <span className="metric-label">Inertial Measurement</span>
                        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {['Pitch', 'Yaw', 'Roll'].map((label, i) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>{label}:</span>
                                    <span style={{ color: 'white' }}>{store.rotation[i].toFixed(3)}°</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="metric-card">
                        <span className="metric-label">Backend Link</span>
                        <div style={{ marginTop: '8px', borderTop: '1px solid var(--glass-border)', paddingTop: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>RPC Service</span>
                                <span style={{ fontSize: '10px', color: 'var(--accent-emerald)' }}>CONNECTED</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Latency</span>
                                <span style={{ fontSize: '10px' }}>1.2ms</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}
