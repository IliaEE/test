import React from 'react';
import { Link } from 'react-router-dom';
import BrainCircuitIcon from '@mui/icons-material/Psychology';
import TwitterIcon from '@mui/icons-material/Twitter';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2">
              <BrainCircuitIcon className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">HRly</span>
            </div>
            <p className="mt-4 text-gray-600 max-w-md">
              Revolutionizing the hiring process through AI-powered interviews. 
              Making recruitment smarter, faster, and more efficient.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <TwitterIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <GitHubIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <LinkedInIcon className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Product
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="#features" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Contact
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="mailto:support@hrly.ai" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  support@hrly.ai
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500">
            © {currentYear} HRly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
