import React from 'react';
import { Link } from 'react-router';

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 min-h-screen flex items-center overflow-hidden bg-[#0D0D0D]">
      {/* --- DYNAMIC BACKGROUND LAYER --- */}
      <div className="absolute inset-0 w-full h-full">
        {/* Spotify Green Blob */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-[#1DB954] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        {/* YouTube Red Blob */}
        <div className="absolute top-0 -right-4 w-96 h-96 bg-[#FF0000] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        {/* Center Blend Blob */}
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        {/* Noise Overlay for Texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* Main Headline */}
        <h1 className="text-5xl tracking-tight font-black sm:text-6xl md:text-7xl lg:text-8xl text-white mb-6 drop-shadow-2xl">
          Don&apos;t Leave Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1DB954] via-white to-[#FF0000]">
            Music Behind.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-400 leading-relaxed">
          The ultimate bridge between <b className="text-white">Spotify</b> and{' '}
          <b className="text-white">YouTube Music</b>. Transfer playlists, fix mismatches, and keep
          the vibe alive.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-5">
          <Link
            to="/connectionDashboard"
            className="group relative px-8 py-4 text-lg font-bold rounded-full text-black bg-[#1DB954] overflow-hidden shadow-[0_0_50px_-10px_rgba(29,185,84,0.4)] hover:shadow-[0_0_50px_-5px_rgba(29,185,84,0.6)] transition-all hover:scale-105"
          >
            <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -translate-x-full"></div>
            <span className="relative flex items-center gap-2">
              Start Free Transfer
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                ></path>
              </svg>
            </span>
          </Link>
        </div>

        {/* --- THE HERO VISUAL (Floating Card with Scanner) --- */}
        <div className="mt-24 relative w-full max-w-5xl mx-auto perspective-1000">
          {/* Glow Effect behind card */}
          <div className="absolute -inset-4 bg-gradient-to-r from-[#1DB954] to-[#FF0000] rounded-2xl blur-2xl opacity-30 animate-pulse"></div>

          <div className="relative bg-[#121212]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden transform transition-transform hover:scale-[1.01] duration-500">
            {/* Top Bar (Mac Style) */}
            <div className="h-8 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
              <div className="ml-auto text-xs text-gray-500 font-mono">
                playswap_transfer_engine.exe
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-stretch min-h-[300px]">
              {/* LEFT: Spotify Source */}
              <div className="flex-1 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 relative">
                <div className="absolute top-4 left-4 text-xs font-bold text-[#1DB954] tracking-widest opacity-50">
                  SOURCE
                </div>
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg"
                  className="h-20 w-20 mb-6 drop-shadow-[0_0_15px_rgba(29,185,84,0.5)]"
                  alt="Spotify"
                />

                {/* Playlist Item */}
                <div className="w-full max-w-[200px] bg-white/5 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-700 rounded flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="h-2 bg-gray-500 rounded w-3/4 mb-1"></div>
                    <div className="h-2 bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="w-full max-w-[200px] bg-white/5 rounded-lg p-3 flex items-center gap-3 mt-2 opacity-50">
                  <div className="w-10 h-10 bg-gray-700 rounded flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="h-2 bg-gray-500 rounded w-3/4 mb-1"></div>
                    <div className="h-2 bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
              </div>

              {/* CENTER: The Processing Engine */}
              <div className="w-full md:w-48 bg-black/40 flex flex-col items-center justify-center relative overflow-hidden py-8 md:py-0">
                {/* Scanning Beam Animation */}
                <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_10px_white] animate-scan z-10"></div>

                {/* Audio Visualizer */}
                <div className="flex items-end gap-1 h-12 mb-4">
                  <div className="w-1 bg-[#1DB954] animate-music-1"></div>
                  <div className="w-1 bg-[#1DB954] animate-music-2"></div>
                  <div className="w-1 bg-white animate-music-3"></div>
                  <div className="w-1 bg-[#FF0000] animate-music-4"></div>
                  <div className="w-1 bg-[#FF0000] animate-music-2"></div>
                </div>

                <div className="bg-white/10 rounded-full p-4 border border-white/10 z-20 backdrop-blur-md">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    ></path>
                  </svg>
                </div>
                <div className="mt-4 text-[10px] uppercase tracking-widest text-gray-500 font-mono">
                  Matching Audio...
                </div>
              </div>

              {/* RIGHT: YouTube Destination */}
              <div className="flex-1 p-8 flex flex-col items-center justify-center relative">
                <div className="absolute top-4 right-4 text-xs font-bold text-[#FF0000] tracking-widest opacity-50">
                  DESTINATION
                </div>
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg"
                  className="h-20 w-20 mb-6 drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]"
                  alt="YouTube"
                />

                {/* Success Item */}
                <div className="w-full max-w-[200px] bg-white/5 rounded-lg p-3 flex items-center gap-3 border border-[#FF0000]/30 shadow-[0_0_10px_rgba(255,0,0,0.1)]">
                  <div className="w-10 h-10 bg-gray-700 rounded flex-shrink-0 overflow-hidden relative">
                    <div className="absolute inset-0 bg-[#FF0000]/20"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="h-2 bg-gray-500 rounded w-3/4 mb-1"></div>
                    <div className="h-2 bg-gray-600 rounded w-1/2"></div>
                  </div>
                  <div className="text-[#FF0000]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
