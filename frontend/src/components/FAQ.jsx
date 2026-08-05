import React from 'react';
import SectionHeader from './SectionHeader';
import GlassCard from './GlassCard';

const FAQ = () => {
  const questions = [
    {
      q: 'Is it safe?',
      a: 'Yes. We use official APIs and never store your passwords.',
    },
    {
      q: 'Why is it slow?',
      a: 'Music platforms have rate limits. We process carefully to avoid blocks.',
    },
    {
      q: 'What if a song is missing?',
      a: 'We flag it. You can use the Resolver tool to find it manually.',
    },
  ];

  return (
    <section id="faq" className="py-24 bg-[#121212]">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-white">FAQ</h2>
        </div>
        <div className="space-y-4">
          {questions.map((item, index) => (
            <GlassCard key={index} className="group">
              <details className="group">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-6 text-lg text-white">
                  <span>{item.q}</span>
                  <span className="transition group-open:rotate-180">
                    <svg
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      width="24"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </summary>
                <p className="text-gray-400 mt-0 px-6 pb-6">{item.a}</p>
              </details>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
