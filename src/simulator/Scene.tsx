import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, PerspectiveCamera, Environment, ContactShadows, Float, Html } from "@react-three/drei";
import { useRef, Suspense, useEffect } from "react";
import * as THREE from "three";
import { useSimulatorStore } from "../store/useSimulatorStore";

function GlassesModel() {
    const groupRef = useRef<THREE.Group>(null);
    const { isKernelRunning, setRotation } = useSimulatorStore();

    useFrame((state) => {
        if (isKernelRunning && groupRef.current) {
            // Simulate slight head movement/drift
            const t = state.clock.getElapsedTime();
            groupRef.current.rotation.x = Math.sin(t * 0.5) * 0.05;
            groupRef.current.rotation.y = Math.cos(t * 0.3) * 0.1;

            // Update store with current rotation
            setRotation([
                groupRef.current.rotation.x * (180 / Math.PI),
                groupRef.current.rotation.y * (180 / Math.PI),
                groupRef.current.rotation.z * (180 / Math.PI)
            ]);
        }
    });

    return (
        <group ref={groupRef} position={[0, 0.5, 0]}>
            {/* Frame */}
            <mesh castShadow>
                <boxGeometry args={[1.5, 0.1, 0.05]} />
                <meshStandardMaterial color="#111" metalness={1} roughness={0.1} />
            </mesh>
            {/* Lenses */}
            <mesh position={[0.4, 0, 0.03]}>
                <boxGeometry args={[0.6, 0.4, 0.01]} />
                <meshStandardMaterial color="#00f2ff" transparent opacity={0.3} metalness={1} roughness={0} />
            </mesh>
            <mesh position={[-0.4, 0, 0.03]}>
                <boxGeometry args={[0.6, 0.4, 0.01]} />
                <meshStandardMaterial color="#00f2ff" transparent opacity={0.3} metalness={1} roughness={0} />
            </mesh>
            {/* Temples */}
            <mesh position={[0.75, 0, -0.4]} rotation={[0, 0, 0]}>
                <boxGeometry args={[0.05, 0.05, 0.8]} />
                <meshStandardMaterial color="#111" metalness={1} roughness={0.1} />
            </mesh>
            <mesh position={[-0.75, 0, -0.4]} rotation={[0, 0, 0]}>
                <boxGeometry args={[0.05, 0.05, 0.8]} />
                <meshStandardMaterial color="#111" metalness={1} roughness={0.1} />
            </mesh>
        </group>
    );
}

function SpatialHUD() {
    const { isKernelRunning, isDisplayOn, batteryLevel } = useSimulatorStore();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!isDisplayOn || !isKernelRunning) return null;

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <group position={[0, 1.2, 0.8]}>
                <mesh>
                    <planeGeometry args={[1.6, 0.9]} />
                    <meshStandardMaterial
                        transparent
                        opacity={0.15}
                        color="#001a1a"
                        roughness={0.1}
                        metalness={0.8}
                        side={THREE.DoubleSide}
                    />
                </mesh>

                {/* Frame Brackets */}
                <mesh position={[0, 0, 0.01]}>
                    <planeGeometry args={[1.65, 0.95]} />
                    <meshBasicMaterial color="#00f2ff" wireframe transparent opacity={0.3} />
                </mesh>

                <Html
                    transform
                    distanceFactor={1}
                    position={[0, 0, 0.02]}
                    scale={0.2}
                    occlude
                >
                    <div className="spatial-os-ui">
                        <header className="os-header">
                            <span className="os-time">{timeStr}</span>
                            <div className="os-status-icons">
                                <div className="os-icon-battery">
                                    <div className="os-battery-level" style={{ width: `${batteryLevel}%` }} />
                                </div>
                            </div>
                        </header>
                        <main className="os-main">
                            <h2 className="os-welcome">Clarigggz OS</h2>
                            <p className="os-desc">Spatial Engine v0.4.2 Active</p>
                            <div className="os-app-row">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="os-app-chip">App-{i}</div>
                                ))}
                            </div>
                        </main>
                    </div>
                </Html>
            </group>
        </Float>
    );
}

function CameraFeed() {
    const isCameraOn = useSimulatorStore(s => s.isCameraOn);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        let stream: MediaStream | null = null;
        if (isCameraOn && videoRef.current) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(s => {
                    stream = s;
                    if (videoRef.current) videoRef.current.srcObject = s;
                })
                .catch(err => console.error("Camera access denied", err));
        }

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isCameraOn]);

    if (!isCameraOn) return null;

    return (
        <group position={[0, 0.5, 0.5]}>
            <mesh>
                <planeGeometry args={[1.6, 1.2]} />
                <meshBasicMaterial color="#000" />
            </mesh>
            <Html transform distanceFactor={1.5} position={[0, 0, 0.01]}>
                <div style={{
                    width: '320px',
                    height: '240px',
                    background: '#000',
                    border: '2px solid var(--accent-cyan)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: 'rgba(0,0,0,0.5)',
                        color: '#ef4444',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontFamily: 'monospace'
                    }}>
                        ● REC
                    </div>
                </div>
            </Html>
        </group>
    );
}

export function Scene() {
    return (
        <div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}>
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[3, 3, 3]} fov={50} />
                <OrbitControls
                    makeDefault
                    enableDamping
                    dampingFactor={0.05}
                    minDistance={1}
                    maxDistance={20}
                />

                <Suspense fallback={null}>
                    <Environment preset="night" />

                    <ambientLight intensity={0.2} />
                    <spotLight position={[5, 10, 5]} angle={0.15} penumbra={1} intensity={2} castShadow />
                    <pointLight position={[-5, -5, -5]} intensity={0.5} color="#2d5bff" />

                    <Grid
                        infiniteGrid
                        fadeDistance={20}
                        fadeStrength={5}
                        cellSize={0.5}
                        sectionSize={2.5}
                        sectionThickness={1.5}
                        sectionColor="#444"
                        cellColor="#222"
                    />

                    <axesHelper args={[2]} />

                    <GlassesModel />
                    <SpatialHUD />
                    <CameraFeed />

                    <ContactShadows
                        position={[0, 0, 0]}
                        opacity={0.4}
                        scale={10}
                        blur={2}
                        far={4}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}
