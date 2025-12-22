import { useState, useEffect, useRef } from 'react';
import { Play, Trash2, Terminal as TerminalIcon } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

export function ScriptTerminal() {
    const [script, setScript] = useState(`// Clarigggz Scripting Engine
// Use rhai syntax

log("Starting diagnostic script...");

kernel_start();

for i in 0..10 {
    let angle = i * 36.0;
    set_rotation(angle, 0.0, 0.0);
    log("Setting rotation to " + angle);
}

log("Diagnostic complete.");
`);
    const [logs, setLogs] = useState<{ timestamp: string, level: string, message: string }[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const runScript = async () => {
        try {
            await invoke('run_script', { script });
            await fetchLogs();
        } catch (error) {
            console.error('Script Error:', error);
            setLogs(prev => [...prev, {
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                message: String(error)
            }]);
        }
    };

    const fetchLogs = async () => {
        try {
            const state: any = await invoke('get_kernel_state');
            setLogs(state.logs);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        }
    };

    useEffect(() => {
        const interval = setInterval(fetchLogs, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="terminal-container glass">
            <div className="terminal-header">
                <div className="flex items-center gap-2">
                    <TerminalIcon size={14} className="text-cyan-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Scripting Engine</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={runScript} className="terminal-btn run">
                        <Play size={12} fill="currentColor" />
                        Run
                    </button>
                    <button onClick={() => setLogs([])} className="terminal-btn">
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>

            <div className="terminal-body">
                <div className="editor-area">
                    <textarea
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        spellCheck={false}
                        className="script-editor"
                    />
                </div>

                <div className="output-area" ref={scrollRef}>
                    {logs.map((log, i) => (
                        <div key={i} className={`log-entry ${log.level.toLowerCase()}`}>
                            <span className="log-time">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                            <span className="log-level">{log.level}</span>
                            <span className="log-msg">{log.message}</span>
                        </div>
                    ))}
                    {logs.length === 0 && (
                        <div className="text-gray-600 italic text-[10px] p-2">Waitng for output...</div>
                    )}
                </div>
            </div>
        </div>
    );
}
