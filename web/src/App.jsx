import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import HomeDetail from './pages/HomeDetail';
import NearbyResults from './pages/NearbyResults';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home/:id" element={<HomeDetail />} />
        <Route path="/home/:id/nearby/:category" element={<NearbyResults />} />
      </Routes>
    </BrowserRouter>
  );
}
