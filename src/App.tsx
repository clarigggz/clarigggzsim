import { Shell } from "./components/Shell";
import { Scene } from "./simulator/Scene";

function App() {
  console.log("App Component Rendering");
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#020202' }}>
      <Shell>
        <Scene />
      </Shell>
    </div>
  );
}

export default App;
