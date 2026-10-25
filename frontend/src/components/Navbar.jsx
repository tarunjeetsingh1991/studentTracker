
import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import LogoutButton from './LogoutButton';

export default function Navbar() {
  return (
    <header className="topbar">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between gap-3">
          <Link
            to="/"
            className="brand d-flex align-items-center gap-2"
          >
            <GraduationCap size={25} />
            <span>Student Progress Tracker</span>
          </Link>

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
