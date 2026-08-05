import React from 'react';
import { Youtube, ArrowRight, MoreHorizontal } from 'lucide-react';

const renderPlatformIcon = (platform) => {
  switch (platform) {
    case 'spotify':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 64 64" className="w-4 h-4 opacity-70">
          <path
            fill="#1ed760"
            d="M32 0C14.3 0 0 14.337 0 32c0 17.7 14.337 32 32 32 17.7 0 32-14.337 32-32S49.663 0 32 0zm14.68 46.184c-.573.956-1.797 1.223-2.753.65-7.532-4.588-16.975-5.62-28.14-3.097-1.07.23-2.14-.42-2.37-1.49s.42-2.14 1.49-2.37c12.196-2.79 22.67-1.606 31.082 3.556a2 2 0 0 1 .688 2.753zm3.9-8.717c-.726 1.185-2.256 1.53-3.44.84-8.602-5.276-21.716-6.805-31.885-3.747-1.338.382-2.714-.344-3.097-1.644-.382-1.338.344-2.714 1.682-3.097 11.622-3.517 26.074-1.835 35.976 4.244 1.147.688 1.49 2.217.765 3.403zm.344-9.1c-10.323-6.117-27.336-6.69-37.2-3.708-1.568.497-3.25-.42-3.747-1.988s.42-3.25 1.988-3.747c11.317-3.44 30.127-2.753 41.98 4.282 1.415.84 1.873 2.676 1.032 4.09-.765 1.453-2.638 1.912-4.053 1.07z"
          />
        </svg>
      );
    case 'ytmusic':
    case 'youtubemusic':
    case 'youtube':
      return <Youtube className="w-4 h-4 opacity-70 text-red-500" />;
    default:
      return null;
  }
};

const TransferCard = ({ activity }) => {
  const getStatusStyles = (status) => {
    const s = status ? status.toLowerCase() : '';
    if (s === 'completed' || s === 'success') {
      return 'bg-green-500/10 text-green-400 border border-green-500/20';
    }
    // The user's HTML snippet uses 'Partial (4)', so we should match the 'Partial' text.
    if (s.includes('partial')) {
      return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
    }
    return 'bg-red-500/10 text-red-400 border border-red-500/20';
  };

  // Convert date to a shorter format, e.g., "Oct 22"
  const dateObj = new Date(activity.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="hover:bg-white/[0.01] transition-all group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-transparent gap-4">
      {/* First "column" - Playlist Name and Track Count */}
      <div className="flex-grow min-w-0">
        <div className="font-bold text-white text-base truncate">{activity.playlistName}</div>
        <div className="text-xs text-gray-500 mt-0.5">{activity.trackCount} tracks</div>
      </div>

      {/* Second "column" - Platform Icons with Arrow */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-black/20 border border-white/5 px-3 py-1.5 rounded-full">
          {renderPlatformIcon(activity.source)}
          <ArrowRight className="w-3 h-3 text-gray-600" />
          {renderPlatformIcon(activity.destination)}
        </div>
      </div>

      {/* Third "column" - Date */}
      <div className="text-gray-500 font-mono text-xs">
        {formattedDate}
      </div>

      {/* Fourth "column" - Status */}
      <div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyles(activity.status)}`}>
          {activity.status}
        </span>
      </div>

      {/* Fifth "column" - More Options Button */}
      <div className="text-right hidden sm:block">
        <button className="text-gray-500 hover:text-white transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TransferCard;
