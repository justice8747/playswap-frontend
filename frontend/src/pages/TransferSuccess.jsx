import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const TransferSuccess = () => {
  return (
    <div className="flex-grow flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#1DB954]/10 rounded-full blur-[100px] pointer-events-none"></div>

      <GlassCard className="w-full max-w-lg p-10 text-center relative border border-white/10 shadow-2xl backdrop-blur-xl animate-fade-in-up">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-green-500/10 rounded-full border border-green-500/20 text-[#1DB954] shadow-[0_0_30px_rgba(29,185,84,0.2)] animate-pulse">
            <CheckCircle2 size={48} />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold mb-3 text-white tracking-tight">Transfer Successful!</h1>
        <p className="text-gray-400 text-base mb-8 max-w-sm mx-auto">
          Your playlists have been successfully synchronized across platforms. The music is ready!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/transfers"
            className="flex-grow sm:flex-none inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-black bg-[#1DB954] hover:bg-[#1ed760] rounded-full transition-all duration-300 shadow-lg shadow-[#1DB954]/15 hover:scale-[1.02]"
          >
            View History <ArrowRight size={16} className="ml-2" />
          </Link>
          <Link
            to="/"
            className="flex-grow sm:flex-none inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-gray-300 hover:text-white border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 rounded-full transition-all duration-300"
          >
            Go Home
          </Link>
        </div>
      </GlassCard>
    </div>
  );
};

export default TransferSuccess;
