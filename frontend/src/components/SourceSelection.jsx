import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight } from 'lucide-react';
import { ConnectionContext } from '../contexts/ConnectionContext.jsx';

const SourceSelectModal = () => {
  const navigate = useNavigate();
  const { dispatch } = useContext(ConnectionContext);

  const HandleSpotifyButtonClick = () => {
    dispatch({ type: 'TOGGLE_MODAL', payload: false });
    navigate(`/playlistselection?source=spotify`);
  };

  const HandleYTMusicButtonClick = () => {
    dispatch({ type: 'TOGGLE_MODAL', payload: false });
    navigate('/playlistselection?source=youtube');
  };

  const onClose = () => {
    dispatch({ type: 'TOGGLE_MODAL', payload: false });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop with Blur */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-[#121212] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 animate-fade-in-up">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Select Transfer Direction</h2>
            <p className="text-sm text-gray-400">
              Which service are we moving music <span className="text-white font-bold">FROM</span>?
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Options Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* OPTION 1: Spotify -> YT Music */}
          <button
            onClick={HandleSpotifyButtonClick}
            className="group relative flex flex-col items-center p-8 rounded-xl border border-gray-700 bg-gradient-to-b from-gray-800/50 to-gray-900/50 hover:border-[#1DB954] hover:from-[#1DB954]/10 transition-all duration-300 text-left"
          >
            <div className="flex items-center gap-4 mb-4">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg"
                className="w-12 h-12 drop-shadow-lg group-hover:scale-110 transition-transform"
                alt="Spotify"
              />
              <ArrowRight className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg"
                className="w-10 h-10 grayscale group-hover:grayscale-0 transition-all"
                alt="YT"
              />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-[#1DB954]">
              From Spotify
            </h3>
            <p className="text-xs text-gray-500 mt-1">Transfer playlists to YouTube Music</p>

            {/* Recommended Badge */}
            <span className="absolute top-4 right-4 bg-[#1DB954] text-black text-[10px] font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              SELECT
            </span>
          </button>

          {/* OPTION 2: YT Music -> Spotify */}
          <button
            onClick={HandleYTMusicButtonClick}
            className="group relative flex flex-col items-center p-8 rounded-xl border border-gray-700 bg-gradient-to-b from-gray-800/50 to-gray-900/50 hover:border-[#FF0000] hover:from-[#FF0000]/10 transition-all duration-300 text-left"
          >
            <div className="flex items-center gap-4 mb-4">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg"
                className="w-12 h-12 drop-shadow-lg group-hover:scale-110 transition-transform"
                alt="YT"
              />
              <ArrowRight className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg"
                className="w-10 h-10 grayscale group-hover:grayscale-0 transition-all"
                alt="Spotify"
              />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-[#FF0000]">
              From YouTube
            </h3>
            <p className="text-xs text-gray-500 mt-1">Transfer playlists to Spotify</p>

            <span className="absolute top-4 right-4 bg-[#FF0000] text-white text-[10px] font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              SELECT
            </span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/20 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500">
            You can change the destination settings in the next step.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SourceSelectModal;
