import React, { useState, useEffect } from 'react';
import { Settings, Play, Terminal as TerminalIcon, Glasses, Monitor, Square, Database, Zap, Cpu, Camera } from 'lucide-react';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { ScriptTerminal } from './Terminal';

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick?: () => void;
}

const SidebarItem = React.memo(({ icon, label, active, onClick }: SidebarItemProps) => (
    <div className={`sidebar-item ${active ? 'active' : ''}`} onClick={onClick}>
        {icon}
        <span className="sidebar-item-label">{label}</span>
    </div>
));

const BadgeLive = () => {
    const isKernelRunning = useSimulatorStore(s => s.isKernelRunning);
    return (
        <div className={`badge-live ${isKernelRunning ? 'live' : 'stopped'}`}
            style={{
                background: isKernelRunning ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: isKernelRunning ? '#10b981' : '#ef4444',
                border: '1px solid currentColor',
                padding: '2px 8px',
                borderRadius: '100px',
                fontSize: '10px',
                marginLeft: '12px',
                textTransform: 'uppercase'
            }}>
            {isKernelRunning ? 'Kernel Live' : 'Kernel Stopped'}
        </div>
    );
};

const HeaderControls = () => {
    const isKernelRunning = useSimulatorStore(s => s.isKernelRunning);
    const isDisplayOn = useSimulatorStore(s => s.isDisplayOn);
    const isCameraOn = useSimulatorStore(s => s.isCameraOn);
    const toggleKernel = useSimulatorStore(s => s.toggleKernel);
    const toggleDisplay = useSimulatorStore(s => s.toggleDisplay);
    const toggleCamera = useSimulatorStore(s => s.toggleCamera);

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
                className="btn-primary"
                onClick={toggleKernel}
                style={{
                    color: isKernelRunning ? '#ef4444' : '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '4px'
                }}
            >
                {isKernelRunning ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                {isKernelRunning ? 'Shut Down' : 'Boot Kernel'}
            </button>
            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
            <button
                className="btn-primary"
                onClick={toggleDisplay}
                style={{
                    padding: '8px',
                    color: isDisplayOn ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    background: 'transparent',
                    border: 'none'
                }}
            >
                <Monitor size={18} />
            </button>
            <button
                className="btn-primary"
                onClick={toggleCamera}
                style={{
                    padding: '8px',
                    color: isCameraOn ? 'var(--accent-emerald)' : 'var(--text-muted)',
                    background: 'transparent',
                    border: 'none',
                    position: 'relative'
                }}
                title="Simulation API: Camera Feed"
            >
                <Camera size={18} />
                {isCameraOn && <div style={{ position: 'absolute', top: '6px', right: '6px', width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', border: '1px solid black' }} />}
            </button>
        </div>
    );
};

const StatusBar = () => {
    const isKernelRunning = useSimulatorStore(s => s.isKernelRunning);
    const batteryLevel = useSimulatorStore(s => s.batteryLevel);
    const rotation = useSimulatorStore(s => s.rotation);

    return (
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
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <Zap size={12} color={batteryLevel < 20 ? '#ef4444' : 'var(--accent-emerald)'} />
                    <div style={{
                        width: '24px', height: '10px', border: '1px solid currentColor',
                        borderRadius: '2px', position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${batteryLevel}%`, height: '100%',
                            background: batteryLevel < 20 ? '#ef4444' : 'var(--accent-emerald)', transition: 'width 0.3s'
                        }} />
                    </div>
                    <span>{batteryLevel}%</span>
                </div>
                <span>XYZ: {rotation[0].toFixed(1)}, {rotation[1].toFixed(1)}, {rotation[2].toFixed(1)}</span>
            </div>
        </footer>
    );
};

const InspectorContent = () => {
    const isKernelRunning = useSimulatorStore(s => s.isKernelRunning);
    const cpuLoad = useSimulatorStore(s => s.cpuLoad);
    const temperature = useSimulatorStore(s => s.temperature);
    const rotation = useSimulatorStore(s => s.rotation);

    return (
        <div className="inspector-content" style={{ padding: '24px' }}>
            <div className="metric-card">
                <span className="metric-label">Node Status</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                    <div>
                        <span className="metric-label">CPU LOAD</span>
                        <span className="metric-value" style={{ color: 'var(--accent-cyan)' }}>
                            {isKernelRunning ? `${cpuLoad.toFixed(1)}%` : '0.0%'}
                        </span>
                    </div>
                    <div>
                        <span className="metric-label">TEMP</span>
                        <span className="metric-value" style={{ color: temperature > 60 ? '#ef4444' : '#fb923c' }}>
                            {isKernelRunning ? `${temperature.toFixed(1)}°C` : '24.2°C'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="metric-card" style={{ marginTop: '16px' }}>
                <span className="metric-label">Inertial Measurement</span>
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {['Pitch', 'Yaw', 'Roll'].map((label, i) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{label}:</span>
                            <span style={{ color: 'white' }}>{rotation[i].toFixed(3)}°</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SettingsContent = () => {
    const apiServerPort = useSimulatorStore(s => s.apiServerPort);
    const toggleApiServer = useSimulatorStore(s => s.toggleApiServer);

    return (
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '600px' }}>
            <div>
                <h3 style={{ fontSize: '11px', marginBottom: '16px', color: 'var(--accent-cyan)', letterSpacing: '2px', fontWeight: '800' }}>LOCAL INTEGRATION</h3>
                <div style={{ background: 'var(--bg-surface-light)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Clarigggz CLI & API</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Expose simulation endpoints for external automation.</div>
                        </div>
                        <button
                            onClick={() => toggleApiServer(apiServerPort === 0)}
                            style={{
                                background: apiServerPort > 0 ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.05)',
                                color: apiServerPort > 0 ? 'black' : 'white',
                                padding: '8px 24px',
                                fontWeight: '700',
                                fontSize: '10px',
                                borderRadius: '100px',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: apiServerPort > 0 ? '0 0 20px rgba(16, 185, 129, 0.3)' : 'none'
                            }}
                        >
                            {apiServerPort > 0 ? 'ACTIVE' : 'ENABLE'}
                        </button>
                    </div>

                    {apiServerPort > 0 && (
                        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Endpoint</span>
                                <code style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>http://localhost:{apiServerPort}</code>
                            </div>
                            <div style={{ background: '#000', borderRadius: '4px', padding: '12px', fontSize: '11px', fontFamily: 'monospace', color: '#666' }}>
                                $ clarigggz --port {apiServerPort} status
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div>
                <h3 style={{ fontSize: '11px', marginBottom: '16px', color: 'var(--text-muted)', letterSpacing: '2px', fontWeight: '800' }}>SYSTEM PREFERENCES</h3>
                <div style={{ padding: '24px', border: '1px dashed var(--glass-border)', borderRadius: '12px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Additional system preferences will be available in v0.5.0
                </div>
            </div>
        </div>
    );
};

export function Shell({ children }: { children: React.ReactNode }) {
    const [activeTab, setActiveTab] = useState<'scripting' | 'inspector' | 'assets' | 'settings'>('scripting');
    const syncWithBackend = useSimulatorStore(s => s.syncWithBackend);
    const isDisplayOn = useSimulatorStore(s => s.isDisplayOn);

    useEffect(() => {
        console.log("Shell Component Mounted - Starting Backend Sync Loop");
        const interval = setInterval(() => {
            syncWithBackend();
        }, 1000);
        return () => clearInterval(interval);
    }, [syncWithBackend]);

    return (
        <div className="shell-container" style={{ background: '#020202', color: 'white' }}>
            {/* Sidebar - Global Navigation */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <Glasses size={22} color="white" />
                </div>

                <div style={{ width: '100%', flex: 1 }}>
                    <SidebarItem
                        icon={<TerminalIcon size={20} />}
                        label="Scripting"
                        active={activeTab === 'scripting'}
                        onClick={() => setActiveTab('scripting')}
                    />
                    <SidebarItem
                        icon={<Cpu size={20} />}
                        label="Inspector"
                        active={activeTab === 'inspector'}
                        onClick={() => setActiveTab('inspector')}
                    />
                    <SidebarItem
                        icon={<Database size={20} />}
                        label="Assets"
                        active={activeTab === 'assets'}
                        onClick={() => setActiveTab('assets')}
                    />
                </div>

                <div style={{ width: '100%' }}>
                    <SidebarItem
                        icon={<Settings size={20} />}
                        label="Settings"
                        active={activeTab === 'settings'}
                        onClick={() => setActiveTab('settings')}
                    />
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-area">
                <header className="top-header">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h1 className="header-title">
                            Clarigggz <span className="header-accent">Spatial Platform</span>
                        </h1>
                        <BadgeLive />
                    </div>
                    <HeaderControls />
                </header>

                {/* Persistent Viewport + Workspace Split */}
                <div className="workspace">
                    <div className="workspace-split">
                        {/* 3D Viewport - Always Visible */}
                        <div className="viewport-container">
                            {children}
                            {!isDisplayOn && (
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                    background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', zIndex: 5, color: 'var(--accent-cyan)',
                                    fontSize: '11px', letterSpacing: '3px', textAlign: 'center',
                                    fontFamily: 'monospace'
                                }}>
                                    / SPATIAL_DISPLAY_OFF /
                                </div>
                            )}
                        </div>

                        {/* Workbench Side Panel - Tabbed Tools */}
                        <div className="workbench-container">
                            <div className="tab-header" style={{ padding: '0 16px', height: '40px', alignItems: 'center' }}>
                                <div className={`tab-item ${activeTab === 'scripting' ? 'active' : ''}`} onClick={() => setActiveTab('scripting')}>
                                    SCRIPTING
                                </div>
                                <div className={`tab-item ${activeTab === 'inspector' ? 'active' : ''}`} onClick={() => setActiveTab('inspector')}>
                                    STATE
                                </div>
                                <div className={`tab-item ${activeTab === 'assets' ? 'active' : ''}`} onClick={() => setActiveTab('assets')}>
                                    ASSETS
                                </div>
                                <div className={`tab-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                                    SETTINGS
                                </div>
                            </div>

                            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                                {activeTab === 'scripting' && <ScriptTerminal />}
                                {activeTab === 'inspector' && <InspectorContent />}
                                {activeTab === 'assets' && (
                                    <div style={{ padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                        No localized assets detected in current workspace.
                                    </div>
                                )}
                                {activeTab === 'settings' && <SettingsContent />}
                            </div>
                        </div>
                    </div>
                </div>

                <StatusBar />
            </main>
        </div>
    );
}
