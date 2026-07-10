import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import HomeDetail from './pages/HomeDetail';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home/:id" element={<HomeDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
