
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { api } from '../api';

export default function LogoutButton() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    try {
      await api('/auth/logout', {
        method: 'POST'
      });

      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className="btn btn-outline-light d-flex align-items-center gap-2"
      disabled={loading}
      onClick={handleLogout}
    >
      <LogOut size={17} />
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  );
}
