import { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Music, Link2, History } from 'lucide-react';
import { ConnectionContext } from '../contexts/ConnectionContext.jsx';
import PlatformSelectorModal from './PlatformSelectorModal.jsx';

const PlaySwapLogo = ({ className = 'h-9 w-auto' }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="swapGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1DB954" />
        <stop offset="100%" stopColor="#FF0000" />
      </linearGradient>
    </defs>
    <path d="M8 6L34 20L8 34V6Z" fill="url(#swapGradient)" className="drop-shadow-lg" />
    <path
      d="M14 15C18 15 17 25 21 25"
      stroke="#0D0D0D"
      strokeWidth="3"
      strokeLinecap="round"
      className="opacity-80"
    />
  </svg>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // Mobile Menu State
  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false);
  const { connections } = useContext(ConnectionContext);
  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === '/';

  const getNavLinkProps = (hash) => {
    if (isHomePage) {
      return { href: hash };
    }
    return { href: `/${hash}` };
  };

  const handlePlaylistsClick = () => {
    const isSpotify = connections?.isSpotifyConnected;
    const isYoutube = connections?.isYoutubeConnected;

    if (isSpotify && isYoutube) {
      setIsPlatformModalOpen(true);
    } else if (isSpotify) {
      navigate('/playlistselection?source=spotify');
    } else if (isYoutube) {
      navigate('/playlistselection?source=ytmusic');
    } else {
      navigate('/connectionDashboard');
    }
  };

  const hasConnections = connections?.isSpotifyConnected || connections?.isYoutubeConnected;

  return (
    <>
      <nav className="fixed w-full z-50 top-0 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* LEFT: Logo & Brand */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-3 cursor-pointer">
              <PlaySwapLogo />
              <span className="font-bold text-2xl text-white tracking-tight hover:text-gray-200 transition-colors">
                PlaySwap
              </span>
            </Link>

            {/* CENTER: Navigation Links (Desktop) */}
            <div className="hidden md:flex items-center space-x-6">
              <a
                {...getNavLinkProps('#how-it-works')}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                How It Works
              </a>
              <a
                {...getNavLinkProps('#features')}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                {...getNavLinkProps('#pricing')}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Pricing
              </a>

              <span className="text-gray-800">|</span>

              {/* Playlists Button/Link */}
              <button
                onClick={handlePlaylistsClick}
                className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location.pathname === '/playlistselection'
                    ? 'text-[#1DB954]'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Music size={15} />
                Playlists
              </button>

              <Link
                to="/connectionDashboard"
                className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location.pathname === '/connectionDashboard'
                    ? 'text-[#1DB954]'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Link2 size={15} />
                Connect
              </Link>

              <Link
                to="/transfers"
                className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location.pathname === '/transfers' ? 'text-[#1DB954]' : 'text-gray-300 hover:text-white'
                }`}
              >
                <History size={15} />
                History
              </Link>
            </div>

            {/* RIGHT: Action Button (Desktop) */}
            <div className="hidden md:block">
              <button
                onClick={handlePlaylistsClick}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-bold text-black bg-[#1DB954] hover:bg-[#1ed760] rounded-full transition-all duration-300 hover:scale-105 shadow-lg shadow-[#1DB954]/20"
              >
                <Music size={16} />
                {hasConnections ? 'View Playlists' : 'Start Transfer'}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-400 hover:text-white p-2"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Content */}
        {isOpen && (
          <div className="md:hidden bg-[#121212] pb-6 px-4 border-t border-gray-800 space-y-3 pt-4">
            <button
              onClick={() => {
                setIsOpen(false);
                handlePlaylistsClick();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-base font-bold text-black bg-[#1DB954] shadow-lg shadow-[#1DB954]/20"
            >
              <Music size={18} />
              View Playlists
            </button>

            <Link
              to="/connectionDashboard"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800"
            >
              Connect Platforms
            </Link>

            <Link
              to="/transfers"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800"
            >
              History Dashboard
            </Link>

            <a
              {...getNavLinkProps('#how-it-works')}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-800"
            >
              How It Works
            </a>
            <a
              {...getNavLinkProps('#features')}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-800"
            >
              Features
            </a>
            <a
              {...getNavLinkProps('#pricing')}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-800"
            >
              Pricing
            </a>
          </div>
        )}
      </nav>

      {/* Platform Selector Modal */}
      <PlatformSelectorModal
        isOpen={isPlatformModalOpen}
        onClose={() => setIsPlatformModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
