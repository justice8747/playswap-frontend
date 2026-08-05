import React from 'react';
import SectionHeader from './SectionHeader';
import GlassCard from './GlassCard';

const Features = () => {
  const features = [
    {
      title: 'The "Match Resolver" Engine',
      desc: 'No more live versions replacing your studio tracks. Listen to and confirm matches before transfer.',
      color: 'text-[#1DB954]',
      bgColor: 'bg-[#1DB954]/20',
    },
    {
      title: 'Background Transfers',
      desc: "Start a transfer and close your tab. We'll email you a detailed report when it's done.",
      color: 'text-[#FF0000]',
      bgColor: 'bg-[#FF0000]/20',
    },
    {
      title: 'Secure & Private',
      desc: 'We use official OAuth APIs. Your credentials never touch our servers.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20',
    },
  ];

  return (
    <section id="features" className="py-24 bg-[#0D0D0D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Why Us" subtitle="The Smarter Way to Move Music" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="w-full md:w-1/2 space-y-8">
            {features.map((feat, idx) => (
              <div key={idx} className="flex">
                <div className="flex-shrink-0">
                  <div
                    className={`flex items-center justify-center h-12 w-12 rounded-md ${feat.bgColor} ${feat.color}`}
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-bold text-white">{feat.title}</h3>
                  <p className="mt-2 text-base text-gray-400">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Feature Visual Placeholder */}
          <div className="w-full md:w-1/2">
            <GlassCard className="rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#121212] via-transparent to-[#1DB954]/10" />
              <div className="text-center z-10">
                <svg
                  className="h-16 w-16 text-gray-700 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
                <p className="text-gray-500 font-bold">Match Resolver UI</p>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Features;
