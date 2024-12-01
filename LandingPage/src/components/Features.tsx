import React from 'react';
import { Brain, Target, Clock, BarChart, Shield, Users } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Advanced algorithms analyze candidate responses for comprehensive evaluation.'
  },
  {
    icon: Target,
    title: 'Precise Matching',
    description: 'Match candidates to positions based on skills, experience, and cultural fit.'
  },
  {
    icon: Clock,
    title: 'Time Efficiency',
    description: 'Reduce hiring time by 60% with automated initial screening process.'
  },
  {
    icon: BarChart,
    title: 'Detailed Analytics',
    description: 'Get insights into candidate performance with detailed scoring metrics.'
  },
  {
    icon: Shield,
    title: 'Bias Prevention',
    description: 'Ensure fair evaluation with our bias-detection technology.'
  },
  {
    icon: Users,
    title: 'Scalable Solution',
    description: 'Handle multiple candidates simultaneously without compromising quality.'
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Revolutionize Your Hiring Process
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Our platform combines cutting-edge AI with practical hiring solutions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border border-gray-200 hover:border-indigo-200 transition-all duration-200 hover:shadow-lg bg-white"
            >
              <feature.icon className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}