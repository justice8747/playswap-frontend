import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TransferCard from '../components/transfers/TransferCard';
import GlassCard from '../components/GlassCard';
import { useTransferHistory } from '../contexts/TransferHistoryContext';
import { Music, RefreshCw, BarChart2, CheckCircle2, Clock, AlertTriangle, Layers, Trash2 } from 'lucide-react';

const TransfersHistoryContent = () => {
  const { transfers, loading, error, fetchTransfers, clearHistory } = useTransferHistory();
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'COMPLETED' | 'PENDING' | 'FAILED'

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  // Aggregate stats across all transfers
  const totalPlaylistsCreated = transfers.reduce((sum, transfer) => {
    if (transfer.jobs && transfer.jobs.length > 0) {
      return sum + transfer.jobs.length;
    }
    if (transfer.playlists && transfer.playlists.length > 0) {
      return sum + transfer.playlists.length;
    }
    return sum + (transfer.totalPlaylists || 1);
  }, 0);

  const totalSongsMoved = transfers.reduce((sum, transfer) => {
    if (typeof transfer.totalTracks === 'number') {
      return sum + transfer.totalTracks;
    }
    if (transfer.jobs && transfer.jobs.length > 0) {
      return sum + transfer.jobs.reduce((jSum, j) => jSum + (j.totalTracks || 0), 0);
    }
    if (transfer.playlists && transfer.playlists.length > 0) {
      return sum + transfer.playlists.reduce((pSum, p) => pSum + (p.trackCount || p.totalTracks || 0), 0);
    }
    return sum + (transfer.trackCount || 0);
  }, 0);

  // Flatten transfers into individual playlist activities
  const allPlaylistActivities = transfers.flatMap((transfer) => {
    // Check if backend returned jobs list (from TransferSessionHistoryDto)
    if (transfer.jobs && transfer.jobs.length > 0) {
      return transfer.jobs.map((job, idx) => ({
        id: `${transfer.id || transfer.sessionId}-${job.jobId || idx}`,
        playlistName: job.playlistName || job.sourcePlaylistName || 'Playlist',
        trackCount: job.totalTracks || job.matchedCount || 0,
        source: transfer.sourcePlatform || transfer.source || 'spotify',
        destination: transfer.targetPlatform || transfer.destination || 'ytmusic',
        date: transfer.createdAt || transfer.date || new Date().toISOString(),
        status: transfer.status || 'COMPLETED',
      }));
    }

    // Check if local or alternative format returned playlists list
    if (transfer.playlists && transfer.playlists.length > 0) {
      return transfer.playlists.map((playlist, idx) => ({
        id: `${transfer.id}-${playlist.id || idx}`,
        playlistName: playlist.name || playlist.playlistName || 'Playlist',
        trackCount: playlist.trackCount || playlist.totalTracks || 0,
        source: transfer.source || transfer.sourcePlatform || 'spotify',
        destination: transfer.destination || transfer.targetPlatform || 'ytmusic',
        date: transfer.createdAt || transfer.date || new Date().toISOString(),
        status: transfer.status || 'COMPLETED',
      }));
    }

    // Single item fallback
    return [
      {
        id: transfer.id || `transfer-${Math.random()}`,
        playlistName: transfer.playlistName || transfer.name || 'Selected Playlists',
        trackCount: transfer.totalTracks || transfer.trackCount || 0,
        source: transfer.source || transfer.sourcePlatform || 'spotify',
        destination: transfer.destination || transfer.targetPlatform || 'ytmusic',
        date: transfer.createdAt || transfer.date || new Date().toISOString(),
        status: transfer.status || 'COMPLETED',
      },
    ];
  });

  // Sort by date descending
  const sortedActivities = [...allPlaylistActivities].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Status counts
  const completedCount = sortedActivities.filter(
    (a) => (a.status || '').toUpperCase() === 'COMPLETED' || (a.status || '').toUpperCase() === 'SUCCESS'
  ).length;
  const pendingCount = sortedActivities.filter(
    (a) =>
      (a.status || '').toUpperCase() === 'PENDING' ||
      (a.status || '').toUpperCase() === 'PROCESSING' ||
      (a.status || '').toUpperCase() === 'IN_PROGRESS'
  ).length;
  const failedCount = sortedActivities.filter(
    (a) => (a.status || '').toUpperCase() === 'FAILED' || (a.status || '').toUpperCase() === 'FAILURE'
  ).length;

  // Filter based on active tab
  const filteredActivities = sortedActivities.filter((act) => {
    const s = (act.status || '').toUpperCase();
    if (activeTab === 'COMPLETED') return s === 'COMPLETED' || s === 'SUCCESS';
    if (activeTab === 'PENDING') return s === 'PENDING' || s === 'PROCESSING' || s === 'IN_PROGRESS';
    if (activeTab === 'FAILED') return s === 'FAILED' || s === 'FAILURE';
    return true;
  });

  if (loading && transfers.length === 0) {
    return (
      <div className="flex-grow flex justify-center items-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Transfers Dashboard</h1>
          <p className="text-sm text-gray-400">Monitor and track all your playlist synchronizations from backend.</p>
        </div>
        <div className="flex items-center gap-2">
          {transfers.length > 0 && (
            <button
              onClick={clearHistory}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-bold rounded-lg text-red-400 transition"
              title="Clear cached history"
            >
              <Trash2 size={13} /> Clear Cache
            </button>
          )}
          <button
            onClick={fetchTransfers}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold rounded-lg text-white transition"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <GlassCard className="p-6 flex items-center justify-between border-green-500/10 hover:border-green-500/20 transition-all duration-300">
          <div>
            <h2 className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Playlists Synced</h2>
            <p className="text-3xl font-black mt-2 text-white">{totalPlaylistsCreated}</p>
          </div>
          <div className="p-4 bg-green-500/10 text-[#1DB954] rounded-2xl border border-green-500/20">
            <Music size={26} />
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center justify-between border-blue-500/10 hover:border-blue-500/20 transition-all duration-300">
          <div>
            <h2 className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Songs Synchronized</h2>
            <p className="text-3xl font-black mt-2 text-white">{totalSongsMoved}</p>
          </div>
          <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
            <BarChart2 size={26} />
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center justify-between border-purple-500/10 hover:border-purple-500/20 transition-all duration-300 sm:col-span-2 lg:col-span-1">
          <div>
            <h2 className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Status Breakdown</h2>
            <div className="flex items-center gap-3 mt-2 text-xs font-bold">
              <span className="text-green-400">{completedCount} Done</span>
              <span className="text-gray-600">•</span>
              <span className="text-yellow-400">{pendingCount} Pending</span>
              <span className="text-gray-600">•</span>
              <span className="text-red-400">{failedCount} Failed</span>
            </div>
          </div>
          <div className="p-4 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
            <Layers size={26} />
          </div>
        </GlassCard>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ALL'
              ? 'bg-[#1DB954] text-black shadow-lg shadow-[#1DB954]/20'
              : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          All ({sortedActivities.length})
        </button>

        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'COMPLETED'
              ? 'bg-green-500 text-black shadow-lg shadow-green-500/20'
              : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <CheckCircle2 size={14} /> Completed ({completedCount})
        </button>

        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'PENDING'
              ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
              : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Clock size={14} /> Pending ({pendingCount})
        </button>

        <button
          onClick={() => setActiveTab('FAILED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'FAILED'
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
              : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <AlertTriangle size={14} /> Failed ({failedCount})
        </button>
      </div>

      {/* History List */}
      {filteredActivities.length > 0 ? (
        <GlassCard className="p-0 border-white/10 overflow-hidden divide-y divide-white/5">
          {filteredActivities.map((activity) => (
            <TransferCard key={activity.id} activity={activity} />
          ))}
        </GlassCard>
      ) : (
        <GlassCard className="p-12 text-center text-gray-400 border-white/10">
          <p className="text-lg font-semibold text-white mb-1">No transfers found</p>
          <p className="text-xs text-gray-500">
            {activeTab === 'ALL'
              ? 'Connect your platforms and start transferring playlists to see your history here.'
              : `There are currently no ${activeTab.toLowerCase()} transfers.`}
          </p>
        </GlassCard>
      )}
    </div>
  );
};

const TransfersHistory = () => <TransfersHistoryContent />;

export default TransfersHistory;
