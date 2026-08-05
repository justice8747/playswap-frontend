import React from 'react';
import SectionHeader from './SectionHeader';
import GlassCard from './GlassCard';

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: 'Connect Accounts',
      desc: 'Securely link your Spotify and YouTube Music accounts.',
      iconColor: 'text-[#1DB954]',
    },
    {
      id: 2,
      title: 'Review Matches',
      desc: 'Our smart system finds matches. You review ambiguous ones.',
      iconColor: 'text-yellow-500',
    },
    {
      id: 3,
      title: 'Transfer & Sync',
      desc: 'Sit back while we build your playlists automatically.',
      iconColor: 'text-[#FF0000]',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#121212]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Simple Process"
          subtitle="How PlaySwap Works"
          description="Move your music in three easy steps. We handle the heavy lifting."
        />
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 text-center">
          {steps.map((step) => (
            <GlassCard
              key={step.id}
              className="p-8 relative group hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gray-800 border-4 border-[#121212] rounded-full flex items-center justify-center font-bold text-xl text-white">
                {step.id}
              </div>
              <div
                className={`mt-6 h-16 w-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 ${step.iconColor}`}
              >
                {/* Simple placeholder icon */}
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
              <p className="text-gray-400">{step.desc}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
};
export default HowItWorks;
