import GlassCard from './GlassCard';
import { useContext, useEffect, useState } from 'react';
import { ConnectionContext } from '../contexts/ConnectionContext.jsx';
import { AuthContext } from '../contexts/AuthContext.jsx';
import LoadingSpinner from './common/LoadingSpinner.jsx';

const ServiceCard = ({ serviceName, logoPath, isConnected, accountName }) => {
  const { dispatch, connections } = useContext(ConnectionContext);
  const { isAuthenticated } = useContext(AuthContext);
  const { isSpotifyConnected, isYoutubeConnected } = connections;
  const [loading, setLoading] = useState(false);

  const loadUser = async (service) => {
    const backendUrl = (import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:9000').replace(/\/api\/?$/, '').replace(/\/+$/, '');
    const apiUrl = (import.meta.env.VITE_API_BASE_URL || `${backendUrl}/api`).replace(/\/+$/, '');
    try {
      const res = await fetch(`${apiUrl}/me/${service}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (res.ok) {
        const user = await res.json();
        console.log(user);

        dispatch({
          type: 'CONNECT_SERVICE',
          payload: {
            service: service,
            profile: user,
          },
        });
      }

      console.log(isAuthenticated);
    } catch (err) {
      console.log(`Failed to load ${service}:`, err);
    }
  };

  useEffect(() => {
    const serviceKey = serviceName.toLowerCase();
    if (!isConnected) {
      loadUser(serviceKey);
    }
  }, []);
  // Empty dependency array = Runs once on component mount

  const handleConnectionToggle = async () => {
    const backendUrl = (import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:9000').replace(/\/api\/?$/, '').replace(/\/+$/, '');
    setLoading(true);
    if (serviceName === 'spotify') {
      if (isSpotifyConnected) {
        dispatch({
          type: 'DISCONNECT_SERVICE',
          payload: { service: 'spotify' },
        });
        setLoading(false);
        return;
      }

      window.location.href = `${backendUrl}/oauth2/authorization/spotify`;
    }

    if (serviceName === 'ytmusic') {
      if (isYoutubeConnected) {
        dispatch({
          type: 'DISCONNECT_SERVICE',
          payload: { service: 'ytmusic' },
        });
        setLoading(false);
        return;
      }

      window.location.href = `${backendUrl}/oauth2/authorization/google`;
    }
  };

  return (
    <GlassCard
      className={`p-6 transition-all duration-300 ${
        isConnected ? 'border-green-500/30 bg-green-500/5' : 'hover:bg-white/10'
      }`}
    >
      <div className="flex justify-between items-start mb-6">
        {/* Logo & Name */}
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center bg-[#121212] shadow-lg border border-white/5`}
          >
            <img src={logoPath} alt={serviceName} className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{serviceName}</h3>
            <div className="flex items-center mt-1">
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-600'
                }`}
              ></span>
              <span
                className={`text-xs font-mono uppercase tracking-wider ${
                  isConnected ? 'text-green-400' : 'text-gray-500'
                }`}
              >
                {isConnected ? 'Active' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleConnectionToggle}
          disabled={loading}
          className={`px-5 py-2 rounded-full text-sm font-bold transition-all w-28 h-10 flex items-center justify-center ${
            isConnected
              ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20'
              : `bg-white text-black hover:scale-105 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]`
          } disabled:opacity-50 disabled:cursor-wait`}
        >
          {loading ? <LoadingSpinner size="w-5 h-5" /> : isConnected ? 'Disconnect' : 'Connect'}
        </button>
      </div>

      {/* Account Info / Description */}
      <div className="border-t border-white/10 pt-4">
        {isConnected ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white">
                {(accountName || 'User').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-white font-medium">Connected as</p>
                <p className="text-xs text-gray-400">{accountName || 'User'}</p>
              </div>
            </div>
            {/* Permission Badge */}
          </div>
        ) : (
          <p className="text-sm text-gray-400 leading-relaxed">
            Connect to access your playlists. We utilize secure OAuth; we never see your password.
          </p>
        )}
      </div>
    </GlassCard>
  );
};

export default ServiceCard;
