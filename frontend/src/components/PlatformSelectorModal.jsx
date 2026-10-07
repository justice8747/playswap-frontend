import React from 'react';
import { X, ArrowRight, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PlatformSelectorModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSelect = (platform) => {
    onClose();
    navigate(`/playlistselection?source=${platform}`);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-[#121212] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md m-4 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#1DB954]/10 border border-[#1DB954]/20 flex items-center justify-center mx-auto mb-3 text-[#1DB954]">
            <Music size={24} />
          </div>
          <h2 className="text-xl font-bold text-white">Select Playlist Library</h2>
          <p className="text-sm text-gray-400 mt-1">
            Choose which platform's library you want to view.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleSelect('spotify')}
            className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-[#1DB954]/10 border border-white/10 hover:border-[#1DB954]/40 rounded-xl group transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg"
                alt="Spotify"
                className="w-8 h-8"
              />
              <div className="text-left">
                <p className="font-bold text-white group-hover:text-[#1DB954] transition-colors">
                  Spotify Playlists
                </p>
                <p className="text-xs text-gray-400">View your Spotify music library</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-gray-500 group-hover:text-[#1DB954] transition-colors" />
          </button>

          <button
            onClick={() => handleSelect('ytmusic')}
            className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/40 rounded-xl group transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg"
                alt="YouTube Music"
                className="w-8 h-8"
              />
              <div className="text-left">
                <p className="font-bold text-white group-hover:text-red-400 transition-colors">
                  YouTube Music Playlists
                </p>
                <p className="text-xs text-gray-400">View your YouTube Music library</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-gray-500 group-hover:text-red-400 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlatformSelectorModal;
