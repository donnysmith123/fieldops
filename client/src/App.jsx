import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import FieldApp from './field/FieldApp';
import AdminDashboard from './admin/AdminDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/field" replace />} />
        <Route path="/field" element={<FieldApp />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
