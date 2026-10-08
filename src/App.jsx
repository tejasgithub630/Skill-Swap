import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import EngineeringDashboard from './pages/EngineeringDashboard';
import MedicalDashboard from './pages/MedicalDashboard';
import ProfileDashboard from './pages/ProfileDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PublicCertificateVerify from './pages/PublicCertificateVerify';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/verify/certificate/:certificateNumber" element={<PublicCertificateVerify />} />
          
          {/* Dedicated Platform Governance Admin Console */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Student / Practitioner Learning Dashboards */}
          <Route
            path="/dashboard/engineering"
            element={
              <ProtectedRoute allowedRole="engineering">
                <EngineeringDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/medical"
            element={
              <ProtectedRoute allowedRole="medical">
                <MedicalDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
