import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <div className="flex space-x-8">
            <Link to="/" className="text-white font-bold text-xl">
              VajraShield
            </Link>
            <Link to="/queue" className="text-indigo-100 hover:text-white">
              Review Queue
            </Link>
            <Link to="/" className="text-indigo-100 hover:text-white">
              Dashboard
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-indigo-100">Admin User</span>
            <button className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
