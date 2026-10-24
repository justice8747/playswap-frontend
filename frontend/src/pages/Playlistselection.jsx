import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Check, Music, CloudCog } from 'lucide-react';
import { ConnectionContext } from '../contexts/ConnectionContext.jsx';
import { PlaylistContext } from '../contexts/PlaylistContext.jsx';
import { useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import AnalysisModal from '../components/AnalysisModal.jsx';

const PlaylistSelection = () => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAnalysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isAnalyzingPlaylists, setIsAnalyzingPlaylists] = useState(false); // New local loading state for analysis

  const navigate = useNavigate();
  const { playlists, dispatch, isLoading: isPlaylistsLoading } = useContext(PlaylistContext); // Use isLoading from context
  const { connections } = useContext(ConnectionContext);

  const [searchParams] = useSearchParams();
  const sourceFromUrl = searchParams.get('source');
  const source = sourceFromUrl;

  const analyzePlaylists = async (playlistsToAnalyze, sourceKey) => {
    setIsAnalyzingPlaylists(true); // Set local loading for analysis
    setAnalysisModalOpen(true); // Open modal to show loading state
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');

    const sourcePlatform = (sourceKey || source || 'spotify').toUpperCase() === 'SPOTIFY' ? 'SPOTIFY' : 'YTMUSIC';
    const targetPlatform = sourcePlatform === 'SPOTIFY' ? 'YTMUSIC' : 'SPOTIFY';

    const playlistIds = playlistsToAnalyze.map((p) => String(p.id));
    const playlistNames = playlistsToAnalyze.reduce((acc, p) => {
      acc[p.id] = p.name;
      return acc;
    }, {});

    const requestPayload = {
      sourcePlatform,
      targetPlatform,
      playlistIds,
      playlistNames,
    };

    try {
      const res = await fetch(`${baseUrl}/transfer/analyze`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Analysis result:', data);
        setSessionId(data.sessionId);

        let summary = {
          stats: {
            total_tracks: 0,
            ready_to_transfer: 0,
            failed_tracks: 0,
            match_percentage: 0,
          },
          missingTracks: [],
        };

        if (Array.isArray(data)) {
          let weightedMatchSum = 0;
          for (const playlistAnalysis of data) {
            const total = playlistAnalysis.stats?.total_tracks || playlistAnalysis.totalTracks || 0;
            const ready = playlistAnalysis.stats?.ready_to_transfer || playlistAnalysis.matchedTracks || 0;
            const failed = playlistAnalysis.stats?.failed_tracks || playlistAnalysis.unmatchedTracks || 0;
            const matchPct = playlistAnalysis.stats?.match_percentage ?? (total > 0 ? (ready / total) * 100 : 0);

            summary.stats.total_tracks += total;
            summary.stats.ready_to_transfer += ready;
            summary.stats.failed_tracks += failed;
            weightedMatchSum += matchPct * total;
            if (playlistAnalysis.Missing_tracks || playlistAnalysis.missingTracks) {
              summary.missingTracks.push(...(playlistAnalysis.Missing_tracks || playlistAnalysis.missingTracks));
            }
          }
          summary.stats.match_percentage = Math.round(
            summary.stats.total_tracks === 0
              ? 0
              : Math.round(weightedMatchSum / summary.stats.total_tracks)
          );
        } else if (data && typeof data === 'object') {
          const total = data.totalTracks ?? data.stats?.total_tracks ?? 0;
          const ready = data.matchedTracks ?? data.stats?.ready_to_transfer ?? 0;
          const failed = data.unmatchedTracks ?? data.stats?.failed_tracks ?? 0;
          const matchPct = total > 0 ? Math.round((ready / total) * 100) : 0;

          summary = {
            stats: {
              total_tracks: total,
              ready_to_transfer: ready,
              failed_tracks: failed,
              match_percentage: matchPct,
            },
            missingTracks: data.missingTracks || data.Missing_tracks || [],
          };
        }

        setAnalysisData(summary);
      } else {
        console.error('Error starting analysis:', res.statusText);
        handleCloseModal();
      }
      setIsAnalyzingPlaylists(false); // Reset local loading for analysis
    } catch (error) {
      setIsAnalyzingPlaylists(false); // Reset local loading for analysis
      console.error('Error starting analysis:', error);
      handleCloseModal();
    }
  };

  const onContinue = () => {
    const playlistsToAnalyze = playlists.filter((p) => selectedIds.includes(p.id));
    setSelectedPlaylists(playlistsToAnalyze);
    const sourceKey = source === 'spotify' ? 'spotify' : 'ytmusic';

    analyzePlaylists(playlistsToAnalyze, sourceKey);
  };

  const handleCloseModal = () => {
    setAnalysisModalOpen(false);
    setAnalysisData(null);
    setSelectedPlaylists([]);
  };

  const getAllPlaylists = async () => {
    dispatch({ type: 'FETCH_PLAYLISTS_START' });
    const sourcekey = source === 'spotify' ? 'spotify' : 'ytmusic';
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
    try {
      const res = await fetch(`${baseUrl}/${sourcekey}/playlists`, {
        method: 'GET',
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Fetched playlists:', data);
        dispatch({ type: 'FETCH_PLAYLISTS_SUCCESS', payload: { playlists: data } });
      } else {
        console.error('Failed to fetch playlists');
        dispatch({
          type: 'FETCH_PLAYLISTS_FAILURE',
          payload: { error: 'Failed to fetch playlists' },
        });
      }
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
      dispatch({
        type: 'FETCH_PLAYLISTS_FAILURE',
        payload: { error: 'Failed to fetch playlists' },
      });
    }
  };

  useEffect(() => {
    if (source) {
      dispatch({ type: 'FETCH_PLAYLISTS_START' });
      const timer = setTimeout(() => {
        getAllPlaylists();
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      dispatch({ type: 'CLEAR_PLAYLISTS' });
    }
  }, [source, dispatch]);

  const filteredPlaylists = playlists?.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPlaylists?.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPlaylists?.map((p) => p.id) || []);
    }
  };

  const totalSelectedTracks = playlists
    ?.filter((p) => selectedIds.includes(p.id))
    .reduce((sum, p) => sum + p.totalTracks, 0);

  const getTarget = () => {
    if (source === 'spotify') {
      return connections.isYoutubeConnected ? 'ytmusic' : null;
    }
    if (source === 'ytmusic' || source === 'youtube') {
      return connections.isSpotifyConnected ? 'spotify' : null;
    }
    return null;
  };

  return (
    <div className="text-white bg-[#0D0D0D] min-h-screen w-full flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between w-full p-4 sm:p-6 border-b border-gray-800/50 sticky top-0 bg-[#0D0D0D]/95 backdrop-blur z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-lg font-bold">Select Playlists</h1>
          <p className="text-xs text-gray-400">{source}</p>
        </div>
        <div className="w-8"></div>
      </header>

      {/* Search & Toolbar */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search your library..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#1DB954] focus:ring-1 focus:ring-[#1DB954] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-400">
            {isPlaylistsLoading
              ? 'Loading playlists...'
              : `${filteredPlaylists?.length || 0} Playlists found`}
          </span>
          <button
            onClick={toggleSelectAll}
            disabled={isPlaylistsLoading || !filteredPlaylists?.length}
            className="text-sm font-semibold text-[#1DB954] hover:text-[#1ed760] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedIds.length === (filteredPlaylists?.length || 0) && (filteredPlaylists?.length || 0) > 0
              ? 'Deselect All'
              : 'Select All'}
          </button>
        </div>
      </div>

      {/* Grid */}
      <main className="w-full max-w-4xl mx-auto flex-grow px-4 sm:px-6 pb-32">
        {isPlaylistsLoading ? (
          <div className="flex flex-col justify-center items-center py-20 w-full gap-3">
            <LoadingSpinner />
            <p className="text-gray-400 text-sm font-medium animate-pulse">Fetching your playlists...</p>
          </div>
        ) : filteredPlaylists && filteredPlaylists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredPlaylists.map((playlist) => {
              const isSelected = selectedIds.includes(playlist.id);
              return (
                <div
                  key={playlist.id}
                  onClick={() => toggleSelection(playlist.id)}
                  className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-green-500/5 border-green-500/30 ring-1 ring-green-500/30'
                      : 'bg-white/5 border-white/5 hover:border-white/20'
                  }`}
                >
                  {/* Image */}
                  <div className="relative w-16 h-16 flex-shrink-0 mr-4">
                    <img
                      src={playlist.imageUrl}
                      alt={playlist.name}
                      className="w-full h-full rounded-lg object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#1DB954]/60 rounded-lg flex items-center justify-center">
                        <Check size={24} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className={`font-semibold ${isSelected ? 'text-[#1DB954]' : 'text-white'}`}>
                      {playlist.name}
                    </h3>
                    <div className="flex items-center text-xs text-gray-400 mt-1">
                      <Music size={12} className="mr-1" />
                      {playlist.totalTracks} Tracks
                    </div>
                  </div>

                  {/* Checkbox visual (optional redundancy) */}
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ml-4 ${
                      isSelected ? 'bg-[#1DB954] border-[#1DB954]' : 'border-gray-600'
                    }`}
                  >
                    {isSelected && <Check size={14} className="text-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center py-20 text-gray-400">
            <p className="text-base font-semibold">No playlists found</p>
          </div>
        )}
      </main>

      {/* Bottom Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[#0D0D0D]/95 backdrop-blur py-4 px-4 sm:px-6 border-t border-gray-800/50">
        <div className="w-full max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-sm text-gray-400">Selected:</p>
            <p className="text-lg font-bold text-white">
              {selectedIds.length} Playlists <span className="text-gray-600">|</span>{' '}
              {totalSelectedTracks} Tracks
            </p>
          </div>
          <button
            onClick={onContinue}
            disabled={selectedIds.length === 0 || isAnalyzingPlaylists} // Disable if analyzing
            className="flex-1 sm:flex-none sm:w-48 bg-[#1DB954] text-black h-12 rounded-xl text-lg font-bold transition duration-300 disabled:bg-white/5 disabled:text-gray-500 disabled:cursor-not-allowed hover:enabled:bg-[#1ed760] hover:enabled:scale-105 hover:enabled:shadow-lg hover:enabled:shadow-[#1DB954]/10"
          >
            Analyze Matches
          </button>
        </div>
      </footer>

      {isAnalysisModalOpen && (
        <AnalysisModal
          onClose={handleCloseModal}
          analysisResult={analysisData}
          playlists={selectedPlaylists}
          sessionId={sessionId}
          source={source}
          target={getTarget()}
        />
      )}
    </div>
  );
};

export default PlaylistSelection;
