import { Shell } from "./components/Shell";
// import { Scene } from "./simulator/Scene";

function App() {
  console.log("App Component Rendering");
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050505' }}>
      <Shell>
        {/* <Scene /> */}
        <div style={{ padding: '40px', color: 'var(--accent-cyan)' }}>
          <h2>SPATIAL ENGINE STANDBY</h2>
          <p>Isolating 3D layer to test desktop compatibility...</p>
        </div>
      </Shell>
    </div>
  );
}

export default App;
