// admin/src/main.jsx — entry point.

import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthGate from './components/AuthGate';
import Shell from './components/Shell';
import NewsAdmin from './pages/NewsAdmin';
import OffersAdmin from './pages/OffersAdmin';
import GalleryAdmin from './pages/GalleryAdmin';
import DownloadsAdmin from './pages/DownloadsAdmin';
import './index.css';

function App() {
  return (
    <div className="design-page">
      <BrowserRouter>
        <AuthGate>
          <Shell>
            <Routes>
              <Route path="/news" element={<NewsAdmin />} />
              <Route path="/offers" element={<OffersAdmin />} />
              <Route path="/gallery" element={<GalleryAdmin />} />
              <Route path="/downloads" element={<DownloadsAdmin />} />
              <Route path="*" element={<Navigate to="/news" replace />} />
            </Routes>
          </Shell>
        </AuthGate>
      </BrowserRouter>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
