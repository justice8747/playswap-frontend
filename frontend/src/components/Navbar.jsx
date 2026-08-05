import { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext, ACTIONS } from '../contexts/AuthContext.jsx';
import { LogOut, User, Menu, X, ChevronDown } from 'lucide-react';

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
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false); // User profile dropdown
  const { isAuthenticated, user, dispatch } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: ACTIONS.LOGOUT });
    setIsUserDropdownOpen(false);
    navigate('/');
  };

  const isHomePage = location.pathname === '/';

  const getNavLinkProps = (hash) => {
    if (isHomePage) {
      return { href: hash };
    }
    return { href: `/${hash}` };
  };

  return (
    <nav className="fixed w-full z-50 top-0 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* LEFT: Logo & Brand */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-3 cursor-pointer">
            <PlaySwapLogo />
            <span className="font-bold text-2xl text-white tracking-tight hover:text-gray-200 transition-colors">PlaySwap</span>
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
            
            {isAuthenticated && (
              <>
                <span className="text-gray-800">|</span>
                <Link
                  to="/connectionDashboard"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/connectionDashboard' ? 'text-[#1DB954]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Connect
                </Link>
                <Link
                  to="/transfers"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/transfers' ? 'text-[#1DB954]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  History
                </Link>
              </>
            )}
          </div>

          {/* RIGHT: User Actions (Desktop) */}
          <div className="hidden md:block">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm text-white transition duration-200"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-[10px] font-bold text-white">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user?.email || 'Account'}</span>
                  <ChevronDown size={14} className="opacity-60" />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#121212] border border-gray-800 rounded-xl shadow-2xl overflow-hidden py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-800">
                      <p className="text-xs text-gray-500 font-medium">Signed in as</p>
                      <p className="text-xs text-gray-300 truncate font-semibold mt-0.5">{user?.email}</p>
                    </div>
                    <Link
                      to="/connectionDashboard"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition"
                    >
                      <User size={14} /> Connections Setup
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-white/5 hover:text-red-300 transition text-left"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-5 py-2 text-sm font-bold text-white hover:text-black border border-white/20 hover:border-[#1DB954] hover:bg-[#1DB954] rounded-full transition-all duration-300 hover:scale-105"
              >
                Sign In
              </Link>
            )}
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
          <a
            {...getNavLinkProps('#how-it-works')}
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800"
          >
            How It Works
          </a>
          <a
            {...getNavLinkProps('#features')}
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800"
          >
            Features
          </a>
          <a
            {...getNavLinkProps('#pricing')}
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800"
          >
            Pricing
          </a>

          {isAuthenticated ? (
            <>
              <div className="border-t border-gray-800 my-2 pt-2"></div>
              <Link
                to="/connectionDashboard"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-[#1DB954] hover:bg-gray-800"
              >
                Connect Services
              </Link>
              <Link
                to="/transfers"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800"
              >
                History Dashboard
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-start gap-2 px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-gray-800 hover:text-red-300"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block text-center px-4 py-2 text-base font-bold text-black bg-[#1DB954] hover:bg-[#1ed760] rounded-full transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
