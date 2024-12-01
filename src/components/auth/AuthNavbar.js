import React from 'react';
import { Link } from 'react-router-dom';
import BrainCircuitIcon from '@mui/icons-material/Psychology';

export function AuthNavbar() {
  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50 py-4 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <Link to="/" className="flex items-center space-x-2 w-fit">
          <BrainCircuitIcon className="h-8 w-8 text-indigo-600" />
          <span className="text-xl font-bold text-gray-900">HRly</span>
        </Link>
      </div>
    </nav>
  );
}
