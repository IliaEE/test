import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative min-h-screen">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
      
      <div className="relative pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Transform Your Hiring Process with{' '}
              <span className="text-indigo-600">AI-Powered Interviews</span>
            </h1>
            
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
              Streamline your recruitment process with our intelligent interview platform. 
              Save time, reduce bias, and find the best candidates efficiently.
            </p>

            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button className="rounded-full bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200 flex items-center gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </button>
              <button className="rounded-full px-8 py-3.5 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:ring-gray-400 transition-all duration-200">
                Learn More
              </button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-x-8 text-sm">
              <div className="flex items-center gap-x-2">
                <CheckCircle className="h-5 w-5 text-indigo-600" />
                <span>AI-Powered Analysis</span>
              </div>
              <div className="flex items-center gap-x-2">
                <CheckCircle className="h-5 w-5 text-indigo-600" />
                <span>Unbiased Evaluation</span>
              </div>
              <div className="flex items-center gap-x-2">
                <CheckCircle className="h-5 w-5 text-indigo-600" />
                <span>24/7 Availability</span>
              </div>
            </div>
          </div>

          <div className="mt-16 rounded-xl bg-white/60 backdrop-blur border border-gray-200 shadow-xl p-8 max-w-5xl mx-auto">
            <img
              src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80&w=2070"
              alt="AI Interview Platform Dashboard"
              className="rounded-lg shadow-lg w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}