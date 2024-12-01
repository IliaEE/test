import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrainCircuitIcon from '@mui/icons-material/Psychology';
import { signOut } from 'firebase/auth';
import { useFirebase } from '../../contexts/FirebaseContext';

export function AuthenticatedNavbar({ companyName }) {
  const navigate = useNavigate();
  const { auth } = useFirebase();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50 py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BrainCircuitIcon className="h-8 w-8 text-indigo-600" />
          <span className="text-xl font-bold text-gray-900">HRly</span>
          {companyName && (
            <>
              <span className="text-gray-400 mx-2">|</span>
              <span className="text-gray-600">{companyName}</span>
            </>
          )}
        </div>
        <div className="flex space-x-6">
          <Link to="/company/dashboard" className="text-gray-600 hover:text-indigo-600 transition-colors">
            Dashboard
          </Link>
          <button
            onClick={handleSignOut}
            className="text-gray-600 hover:text-indigo-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
