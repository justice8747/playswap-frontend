import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import SourceSelection from '../components/SourceSelection.jsx';
import { ConnectionContext } from '../contexts/ConnectionContext.jsx';

const ConnectionDashboard = () => {
  const navigate = useNavigate();

  const { dispatch, isSourceModalOpen, connections, userProfiles } = useContext(ConnectionContext);
  const { spotifyProfile, youtubeProfile } = userProfiles;

  const { isSpotifyConnected, isYoutubeConnected } = connections;

  const canContinue = isSpotifyConnected && isYoutubeConnected;
  const spotifyAccountName = spotifyProfile
    ? spotifyProfile.email || spotifyProfile.spotifyId || 'user'
    : 'user';
  const ytmusicAccountName = youtubeProfile
    ? youtubeProfile.email || youtubeProfile.ytMusicName || youtubeProfile.youtubeId || 'user'
    : 'user';

  // console.log(youtubeProfile, youtubeProfile.email);

  const handleContinue = () => {
    if (canContinue) {
      dispatch({ type: 'TOGGLE_MODAL', payload: true });
    }
  };

  return (
    <div className="bg-[#0D0D0D] min-h-screen w-full text-white font-sans selection:bg-[#1DB954] selection:text-black flex flex-col">
      {/* Source Selection Modal */}
      {isSourceModalOpen && <SourceSelection />}

      <header className="flex items-center justify-between w-full p-6 sticky top-0 z-50 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-white/5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 transition text-gray-300 hover:text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold tracking-wide uppercase text-gray-400">Setup</h1>
        <div className="w-10"></div> {/* Spacer */}
      </header>

      <main className="flex-grow w-full max-w-3xl mx-auto px-6 pt-8 pb-32">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Connect Services</h1>
          <p className="text-gray-400 text-lg">
            Manage access to your music libraries. At least two services must be active to perform a
            swap.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* 1. Spotify Card */}
          <ServiceCard
            serviceName="spotify"
            logoPath="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg"
            isConnected={isSpotifyConnected}
            accountName={spotifyAccountName}
          />

          {/* 2. YouTube Music Card */}
          <ServiceCard
            serviceName="ytmusic"
            logoPath="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg"
            isConnected={isYoutubeConnected}
            accountName={ytmusicAccountName}
          />

          {/* 3. Apple Music (Coming Soon / Upsell) */}

          <GlassCard className="p-6 opacity-60 border-dashed border-gray-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-[#121212] border border-white/5 grayscale">
                  <svg className="w-8 h-8 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 13.5l-6-3.5v-7l6 3.5v7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-400">Apple Music</h3>
                  <span className="text-xs font-mono uppercase tracking-wider text-gray-600">
                    Coming Soon
                  </span>
                </div>
              </div>
              <button
                disabled
                className="px-5 py-2 rounded-full text-sm font-bold bg-white/5 text-gray-500 cursor-not-allowed"
              >
                Waitlist
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Security Note Footer */}
        <div className="mt-12 text-center border-t border-gray-800 pt-8">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Data is encrypted in transit. We do not store your credentials.
          </p>
        </div>
      </main>

      {/* --- Sticky Footer --- */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 p-6 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D] to-transparent">
        <div className="max-w-3xl mx-auto">
          {!canContinue && (
            <div className="mb-4 flex items-center justify-center text-yellow-500/80 text-sm animate-pulse">
              <AlertCircle size={16} className="mr-2" />
              Connect both services to continue
            </div>
          )}

          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={`w-full h-16 rounded-2xl text-lg font-bold tracking-wide shadow-2xl transition-all duration-300 transform ${
              canContinue
                ? 'bg-gradient-to-r from-[#1DB954] to-[#1ed760] text-black hover:scale-[1.02] hover:shadow-[0_0_40px_-10px_rgba(29,185,84,0.5)] cursor-pointer'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue to Select Playlists
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ConnectionDashboard;
