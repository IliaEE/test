import React from 'react';
import { BrainCircuit } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50 py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="h-8 w-8 text-indigo-600" />
          <span className="text-xl font-bold text-gray-900">HRly</span>
        </div>
        <div className="hidden md:flex space-x-6">
          <a href="#features" className="text-gray-600 hover:text-indigo-600 transition-colors">Features</a>
          <a href="#how-it-works" className="text-gray-600 hover:text-indigo-600 transition-colors">How it Works</a>
          <a href="#pricing" className="text-gray-600 hover:text-indigo-600 transition-colors">Pricing</a>
        </div>
      </div>
    </nav>
  );
}
