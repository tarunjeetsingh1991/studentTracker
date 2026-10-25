import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../api';

export default function ProtectedRoute({ children }) {

  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    let active = true;

    async function checkAuthentication() {
      try {
        await api('/auth/me');

        if (active) {
          setAuthenticated(true);
        }
      } catch (error) {
        if (active) {
          setAuthenticated(false);
        }
      }
    }

    checkAuthentication();

    return () => {
      active = false;
    };
  }, []);

  // Wait until session validation completes
  if (authenticated === null) {
    return (
      <div className="container min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            role="status"
          />
          <p className="mt-3 text-muted">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login when no valid session exists
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
