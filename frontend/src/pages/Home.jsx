import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import Features from '../components/Features';
import Pricing from '../components/Pricing';
import FAQ from '../components/FAQ';

const Home = () => {
  return (
    <div className="bg-[#0D0D0D] min-h-screen font-sans selection:bg-[#1DB954] selection:text-black">
      <Hero />
      <HowItWorks />
      <Features />
      <Pricing />
      <FAQ />
    </div>
  );
};

export default Home;
