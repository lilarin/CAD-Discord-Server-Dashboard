import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Categories from "@/pages/Categories.tsx";
import Groups from "@/pages/Groups";
import Users from "@/pages/Users";
import Events from "@/pages/Events";
import Archivation from "@/pages/Archivation";
import Logs from "@/pages/Logs";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import LoginPage from '@/pages/LoginPage';
import ProtectedRoute from '@/components/ProtectedRoute';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster />
        <Routes>
          <Route path="/login" element={<LoginPage />} /> {/* Сторінка логіна без ProtectedRoute */}
          <Route path="/" element={<ProtectedRoute><Navigate to="/disciplines" replace /></ProtectedRoute> } />
          <Route path="/disciplines" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
          <Route path="/archivation" element={<ProtectedRoute><Archivation /></ProtectedRoute>} />
          <Route path="/logs" element={<ProtectedRoute><Logs /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;