import React from 'react';
import { Navbar } from './landing/Navbar';
import { Hero } from './landing/Hero';
import { Footer } from './landing/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Footer />
    </div>
  );
};

export default LandingPage;
