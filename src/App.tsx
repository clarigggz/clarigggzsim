import React, { Suspense } from 'react';
import { Shell } from "./components/Shell";
import { Scene } from "./simulator/Scene";

function App() {
  return (
    <Suspense fallback={<div style={{ color: 'white', padding: '20px' }}>Loading Spatial Engine...</div>}>
      <Shell>
        <Scene />
      </Shell>
    </Suspense>
  );
}

export default App;
