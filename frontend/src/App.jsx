
import React from 'react';

import {
  Routes,
  Route,
  Navigate,
  Outlet
} from 'react-router-dom';

import Login from './pages/Login';
import Home from './pages/Home';
import ClassPage from './pages/ClassPage';
import StudentPage from './pages/StudentPage';

import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Navbar />

      <main className="container py-4">
        <Outlet />
      </main>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>

      {/* Public login page */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/* Protected application */}
      <Route element={<ProtectedLayout />}>

        {/* Homepage */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* Classroom roster */}
        <Route
          path="/class/:code"
          element={<ClassPage />}
        />

        {/* Student profile */}
        <Route
          path="/student/:id"
          element={<StudentPage />}
        />

      </Route>

      {/* Unknown routes */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}
