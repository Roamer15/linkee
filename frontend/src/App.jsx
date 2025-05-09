import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
// import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
// import Dashboard from './components/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/login" element={<LoginPage />} /> */}
        <Route path="/register" element={<RegisterPage />} />
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      </Routes>
    </BrowserRouter>
  );
}