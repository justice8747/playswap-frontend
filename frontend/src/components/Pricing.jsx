import SectionHeader from './SectionHeader';
import GlassCard from './GlassCard';
const Pricing = () => (
  <section id="pricing" className="py-24 bg-[#0D0D0D]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        title="Pricing"
        subtitle="Simple, Transparent Pricing"
        description="Start for free. Upgrade when you need more power."
      />

      <div className="flex flex-col md:flex-row justify-center gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <GlassCard className="w-full md:w-1/2 p-8 rounded-3xl relative">
          <h3 className="text-2xl font-bold text-white">Free</h3>
          <div className="mt-4 flex items-baseline">
            <span className="text-5xl font-extrabold tracking-tight text-white">$0</span>
            <span className="ml-1 text-xl font-semibold text-gray-400">/forever</span>
          </div>
          <ul className="mt-8 space-y-4 text-gray-300">
            {['Transfer up to 100 songs', 'Basic Match Resolution'].map((item, i) => (
              <li key={i} className="flex items-center">
                <span className="text-[#1DB954] mr-3">✓</span> {item}
              </li>
            ))}
            <li className="flex items-center text-gray-500">
              <span className="mr-3">×</span> Playlist Auto-Sync
            </li>
          </ul>
          <button className="mt-10 w-full px-4 py-3 font-bold rounded-lg text-white bg-gray-800 hover:bg-gray-700 transition-colors">
            Get Started Free
          </button>
        </GlassCard>

        {/* Pro Plan */}
        <GlassCard className="w-full md:w-1/2 p-8 rounded-3xl border-[#1DB954] shadow-[0_0_40px_-10px_rgba(29,185,84,0.3)] relative">
          <div className="absolute top-0 right-0 bg-[#1DB954] text-black text-xs font-bold px-3 py-1 rounded-bl-lg uppercase">
            POPULAR
          </div>
          <h3 className="text-2xl font-bold text-white">Pro</h3>
          <div className="mt-4 flex items-baseline">
            <span className="text-5xl font-extrabold tracking-tight text-white">$4.99</span>
            <span className="ml-1 text-xl font-semibold text-gray-400">/month</span>
          </div>
          <ul className="mt-8 space-y-4 text-gray-300">
            {[
              'Unlimited Transfers',
              'Advanced Match Resolver',
              'Daily Auto-Sync',
              'Priority Support',
            ].map((item, i) => (
              <li key={i} className="flex items-center">
                <span className="text-[#1DB954] mr-3">✓</span> {item}
              </li>
            ))}
          </ul>
          <button className="mt-10 w-full px-4 py-3 font-bold rounded-lg text-black bg-[#1DB954] hover:bg-[#1ed760] transition-colors shadow-lg">
            Upgrade to Pro
          </button>
        </GlassCard>
      </div>
    </div>
  </section>
);
export default Pricing;
