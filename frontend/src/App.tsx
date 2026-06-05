import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CameraPage from './pages/CameraPage';
import ViewerPage from './pages/ViewerPage';
import PairingPage from './pages/PairingPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/camera" element={<CameraPage />} />
        <Route path="/viewer" element={<ViewerPage />} />
        <Route path="/pairing" element={<PairingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
