import React, { useEffect } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TransferCard from '../components/transfers/TransferCard';
import GlassCard from '../components/GlassCard';
import { TransferHistoryProvider, useTransferHistory } from '../contexts/TransferHistoryContext';
import { Music, RefreshCw, BarChart2 } from 'lucide-react';

const TransfersHistoryContent = () => {
  const { transfers, loading, error, fetchTransfers } = useTransferHistory();

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const totalPlaylistsCreated = transfers.reduce((sum, transfer) => sum + (transfer.playlists ? transfer.playlists.length : 0), 0);
  const totalSongsMoved = transfers.reduce((sum, transfer) =>
    sum + (transfer.playlists ? transfer.playlists.reduce((playlistSum, playlist) => playlistSum + (playlist.trackCount || 0), 0) : 0), 0);

  const allPlaylistActivities = transfers.flatMap(transfer =>
    transfer.playlists ? transfer.playlists.map(playlist => ({
      id: `${transfer.id}-${playlist.id}`,
      playlistName: playlist.name,
      trackCount: playlist.trackCount || 0,
      source: transfer.source,
      destination: transfer.destination,
      date: transfer.createdAt,
      status: transfer.status,
    })) : []
  );

  // Sort all playlist activities by date and take the most recent 5
  const recentActivityPlaylists = allPlaylistActivities
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex-grow flex justify-center items-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex justify-center items-center py-20 px-4">
        <GlassCard className="p-6 border-red-500/20 bg-red-500/5 text-center text-red-400">
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchTransfers}
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white text-xs font-bold rounded-lg transition"
          >
            Try Again
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-6 py-10">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Transfers Dashboard</h1>
          <p className="text-sm text-gray-500">Monitor and track your historical playlist syncs.</p>
        </div>
        <button
          onClick={fetchTransfers}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs font-bold rounded-lg transition"
        >
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <GlassCard className="p-6 flex items-center justify-between border-green-500/10 hover:border-green-500/20 transition-all duration-300">
          <div>
            <h2 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Playlists Transferred</h2>
            <p className="text-4xl font-black mt-2 text-white">{totalPlaylistsCreated}</p>
          </div>
          <div className="p-4 bg-green-500/10 text-[#1DB954] rounded-2xl border border-green-500/20">
            <Music size={28} />
          </div>
        </GlassCard>
        
        <GlassCard className="p-6 flex items-center justify-between border-[#FF0000]/10 hover:border-[#FF0000]/20 transition-all duration-300">
          <div>
            <h2 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Songs Synchronized</h2>
            <p className="text-4xl font-black mt-2 text-white">{totalSongsMoved}</p>
          </div>
          <div className="p-4 bg-[#FF0000]/10 text-[#FF0000] rounded-2xl border border-[#FF0000]/20">
            <BarChart2 size={28} />
          </div>
        </GlassCard>
      </div>

      {/* Recent Activity */}
      <h2 className="text-xl font-bold mb-6 text-white tracking-wide uppercase">Recent Syncs</h2>
      {recentActivityPlaylists.length > 0 ? (
        <div className="space-y-4">
          {recentActivityPlaylists.map((activity) => (
            <GlassCard key={activity.id} className="p-0 border-white/5 overflow-hidden">
              <TransferCard activity={activity} />
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="p-12 text-center text-gray-500">
          <p className="text-lg font-medium">No recent transfers found</p>
          <p className="text-sm text-gray-600 mt-1">Connect services and select playlists to start transferring.</p>
        </GlassCard>
      )}
    </div>
  );
};

const TransfersHistory = () => (
  <TransferHistoryProvider>
    <TransfersHistoryContent />
  </TransferHistoryProvider>
);

export default TransfersHistory;
