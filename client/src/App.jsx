import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// ✅ FIX: Swapped to react-toastify so it matches all your components perfectly
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 

// --- MIDDLEWARE ---
import ProtectedRoute from "./components/ProtectedRoute"; 

// --- PAGES ---
import Login from "./pages/Login";
import Signup from "./pages/Signup"; 
import Dashboard from "./pages/Dashboard"; 
import SupervisorDashboard from './pages/SupervisorDashboard';
import AdminDashboard from "./pages/AdminDashboard";

// --- COMPONENTS ---
import ProjectArchive from "./components/supervisor/ProjectArchive";

function App() {
  return (
    <Router>
      {/* ✅ Premium Global Notifications (React-Toastify) */}
      <ToastContainer 
        position="bottom-right" 
        autoClose={4000} 
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastStyle={{
          borderRadius: '1rem',
          fontSize: '12px',
          fontWeight: 'bold',
          letterSpacing: '0.05em',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
        }}
      />

      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} /> 

        {/* --- STUDENT ROUTES --- */}
        <Route path="/dashboard" element={
          <ProtectedRoute role="student">
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* --- SUPERVISOR ROUTES --- */}
        <Route path="/supervisor-dashboard" element={
          <ProtectedRoute role="supervisor">
            <SupervisorDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/supervisor/archive" element={
          <ProtectedRoute role="supervisor">
            <ProjectArchive />
          </ProtectedRoute>
        } />
        
        {/* --- ADMIN ROUTES --- */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* --- FALLBACK --- */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;