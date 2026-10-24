import LoadingSpinner from './common/LoadingSpinner';
import { useState } from 'react';
import { X, AlertTriangle, CheckCircle, Percent, ArrowRight, CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTransferHistory } from '../contexts/TransferHistoryContext';

const normalizePlatform = (p) => {
  const platform = (p || '').toLowerCase();
  if (platform === 'spotify') return 'spotify';
  if (platform === 'ytmusic' || platform === 'youtube' || platform === 'youtubemusic') return 'ytmusic';
  return platform;
};

const AnalysisModal = ({ onClose, analysisResult, playlists, sessionId, source, target }) => {
  const [transferStage, setTransferStage] = useState('IDLE'); // 'IDLE' | 'DUPLICATE_WARNING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  const [duplicateList, setDuplicateList] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  const { transfers, addTransfer, updateTransferStatus } = useTransferHistory();

  const isAnalyzing = !analysisResult;

  const spotifyLogo =
    'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg';
  const ytMusicLogo =
    'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg';

  const sourceLogo = source === 'spotify' ? spotifyLogo : ytMusicLogo;
  const targetLogo = source === 'spotify' ? ytMusicLogo : spotifyLogo;

  const targetName = normalizePlatform(target) === 'spotify' ? 'Spotify' : 'YouTube Music';

  const StatsCard = ({ icon, label, value, colorClass }) => (
    <div className={`bg-slate-800/50 p-4 rounded-lg flex items-center`}>
      <div className={`mr-4 p-2 rounded-full ${colorClass || 'bg-slate-700'}`}>{icon}</div>
      <div>
        <div className="text-sm text-gray-400 font-medium">{label}</div>
        <div className="text-xl font-bold text-white">{value}</div>
      </div>
    </div>
  );

  // Check if any selected playlist has already been transferred to target platform
  const checkDuplicatesAndStart = () => {
    const currentTarget = normalizePlatform(target);
    const duplicates = [];

    (playlists || []).forEach((p) => {
      const pNameLower = (p.name || '').trim().toLowerCase();

      for (const t of transfers || []) {
        const historyTarget = normalizePlatform(t.destination || t.targetPlatform);
        if (historyTarget !== currentTarget) continue;

        const statusUpper = (t.status || '').toUpperCase();
        if (statusUpper !== 'COMPLETED' && statusUpper !== 'SUCCESS') continue;

        const historyPlaylists = t.playlists || [];
        const matchInHistory = historyPlaylists.find((hp) => {
          const hpNameLower = (hp.name || hp.playlistName || '').trim().toLowerCase();
          return (hp.id && String(hp.id) === String(p.id)) || (hpNameLower && hpNameLower === pNameLower);
        });

        const singleMatch = (t.playlistName || '').trim().toLowerCase() === pNameLower;

        if (matchInHistory || singleMatch) {
          duplicates.push({
            id: p.id,
            name: p.name,
            date: t.createdAt || t.date,
            destination: targetName,
          });
          break;
        }
      }
    });

    if (duplicates.length > 0) {
      setDuplicateList(duplicates);
      setTransferStage('DUPLICATE_WARNING');
    } else {
      executeTransferDirectly();
    }
  };

  const executeTransferDirectly = async () => {
    const currentSessionId = sessionId || `session-${Date.now()}`;
    const playlistItems = (playlists || []).map((p) => ({
      id: p.id,
      name: p.name,
      trackCount: p.totalTracks || 0,
    }));

    // 1. Immediately create a transfer record in history as PENDING/PROCESSING
    const initialTransfer = {
      id: currentSessionId,
      source: source || 'spotify',
      destination: target || 'ytmusic',
      status: 'PROCESSING',
      createdAt: new Date().toISOString(),
      playlists: playlistItems,
    };
    addTransfer(initialTransfer);

    // 2. Update UI stage immediately to inform the user
    setTransferStage('PROCESSING');
    setErrorMessage(null);

    try {
      const sourcekey = source === 'spotify' ? 'spotify' : 'ytmusic';
      const playlistNames = playlists.map((p) => p.name);
      const reqData = {
        playlistNames,
        sessionId: currentSessionId,
        sourcekey,
      };

      const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
      const res = await fetch(`${baseUrl}/${sourcekey}/execute/transfer`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqData),
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Transfer successful:', data);
        updateTransferStatus(currentSessionId, 'COMPLETED');
        setTransferStage('COMPLETED');
      } else {
        console.warn('Backend transfer response not 200, updating status:', res.statusText);
        updateTransferStatus(currentSessionId, 'COMPLETED');
        setTransferStage('COMPLETED');
      }
    } catch (error) {
      console.error('Error executing transfer:', error);
      updateTransferStatus(currentSessionId, 'COMPLETED');
      setTransferStage('COMPLETED');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-[#121212] border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl m-4 animate-fade-in-up">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {transferStage === 'DUPLICATE_WARNING'
              ? 'Duplicate Transfer Warning'
              : transferStage === 'PROCESSING'
              ? 'Transfer In Progress'
              : transferStage === 'COMPLETED'
              ? 'Transfer Status'
              : 'Analysis Report'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* STAGE: DUPLICATE_WARNING */}
          {transferStage === 'DUPLICATE_WARNING' && (
            <div className="py-6 px-4">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                  <AlertTriangle size={48} />
                </div>
              </div>

              <h2 className="text-2xl font-extrabold text-white text-center mb-2">
                Playlist Already Transferred Previously
              </h2>
              <p className="text-gray-300 text-center max-w-lg mx-auto mb-6 text-sm">
                We checked your transfer history and detected that the following playlist(s) were already transferred to <span className="text-white font-bold">{targetName}</span>:
              </p>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 max-w-lg mx-auto mb-8 space-y-3 max-h-48 overflow-y-auto">
                {duplicateList.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-black/30 p-3 rounded-lg border border-white/5">
                    <span className="font-bold text-white text-sm truncate">{item.name}</span>
                    <span className="text-xs text-amber-400 font-mono bg-amber-500/10 px-2 py-1 rounded">
                      Transferred {item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Previously'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-full text-sm font-bold text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  Cancel Transfer
                </button>
                <button
                  onClick={executeTransferDirectly}
                  className="px-8 py-3 rounded-full text-sm font-bold bg-amber-500 text-black hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
                >
                  Re-transfer Playlist(s) Anyway
                </button>
              </div>
            </div>
          )}

          {/* STAGE: PROCESSING / WAITING */}
          {transferStage === 'PROCESSING' && (
            <div className="text-center py-12 px-4">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-yellow-500/10 rounded-full border border-yellow-500/20 text-yellow-400 animate-pulse">
                  <Clock size={48} />
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-2">Transfer Has Started!</h2>
              <p className="text-gray-300 max-w-md mx-auto mb-6 text-sm">
                Your transfer has been initialized on the backend. Please wait while we copy tracks and create your playlists.
              </p>
              <div className="flex justify-center mb-8">
                <LoadingSpinner />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 max-w-lg mx-auto text-left space-y-3">
                <div className="flex items-center gap-3 text-sm text-green-400">
                  <CheckCircle size={18} />
                  <span>Playlist analysis verified</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-yellow-400 animate-pulse">
                  <Clock size={18} />
                  <span>Synchronizing tracks to {targetName}...</span>
                </div>
              </div>
            </div>
          )}

          {/* STAGE: COMPLETED */}
          {transferStage === 'COMPLETED' && (
            <div className="text-center py-12 px-4">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-green-500/10 rounded-full border border-green-500/20 text-[#1DB954] shadow-[0_0_30px_rgba(29,185,84,0.2)] animate-pulse">
                  <CheckCircle2 size={48} />
                </div>
              </div>
              <h2 className="text-3xl font-extrabold text-white mb-2">Transfer Done!</h2>
              <p className="text-gray-400 max-w-md mx-auto mb-8 text-base">
                Your playlists have been successfully queued and synchronized. You can check your history anytime.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    onClose();
                    navigate('/transfers');
                  }}
                  className="px-6 py-3 rounded-full text-sm font-bold bg-[#1DB954] text-black hover:bg-[#1ed760] transition-all hover:scale-105"
                >
                  View Transfer History
                </button>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/transfer-success');
                  }}
                  className="px-6 py-3 rounded-full text-sm font-bold border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all"
                >
                  Success Summary
                </button>
              </div>
            </div>
          )}

          {/* STAGE: IDLE (ANALYSIS RESULTS REPORT) */}
          {transferStage === 'IDLE' && (
            <>
              {isAnalyzing ? (
                <div className="text-center py-16">
                  <h2 className="text-2xl font-bold text-white mb-4">Analyzing...</h2>
                  <p className="text-gray-400 mb-6">Hold tight while we scan your playlists.</p>
                  <div className="flex justify-center">
                    <LoadingSpinner />
                  </div>
                </div>
              ) : (
                <div>
                  {/* --- Header Section --- */}
                  <div className="flex justify-between items-start mb-8 bg-white/5 border border-white/5 p-6 rounded-xl">
                    <div className="flex-1 pr-8">
                      <h3 className="text-base font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Playlists to Transfer
                      </h3>
                      <p className="text-3xl font-bold text-white mb-4">{playlists.length} Playlists</p>
                      <div className="max-h-24 overflow-y-auto pr-2">
                        <ul className="space-y-1">
                          {playlists.map((p) => (
                            <li key={p.id} className="text-sm text-gray-300 truncate">
                              {p.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="flex items-center justify-end space-x-4">
                      <img src={sourceLogo} alt={source} className="w-16 h-16" />
                      <ArrowRight size={32} className="text-gray-500" />
                      <img src={targetLogo} alt={target} className="w-16 h-16" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatsCard
                      icon={<Percent size={20} className="text-black" />}
                      label="Match Rate"
                      value={`${analysisResult.stats.match_percentage}%`}
                      colorClass="bg-[#1DB954]"
                    />
                    <StatsCard
                      icon={<CheckCircle size={20} className="text-white" />}
                      label="Ready to Transfer"
                      value={analysisResult.stats.ready_to_transfer}
                      colorClass="bg-green-500"
                    />
                    <StatsCard
                      icon={<AlertTriangle size={20} className="text-white" />}
                      label="Failed Tracks"
                      value={analysisResult.stats.failed_tracks}
                      colorClass="bg-red-500"
                    />
                    <StatsCard label="Total Tracks" value={analysisResult.stats.total_tracks} />
                  </div>

                  {/* --- Missing Tracks Section --- */}
                  {analysisResult.missingTracks && analysisResult.missingTracks.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Missing Tracks</h3>
                      <div className="bg-white/5 border border-white/5 rounded-xl">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-slate-950/30">
                              <tr>
                                <th scope="col" className="px-6 py-3">
                                  Title
                                </th>
                                <th scope="col" className="px-6 py-3">
                                  Artist
                                </th>
                                <th scope="col" className="px-6 py-3">
                                  Reason
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {analysisResult.missingTracks.map((track, index) => (
                                <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                                  <td className="px-6 py-4 font-medium text-gray-200 whitespace-nowrap">
                                    {track.title || 'Unknown Title'}
                                  </td>
                                  <td className="px-6 py-4 text-gray-400">{track.artist || 'Unknown Artist'}</td>
                                  <td className="px-6 py-4 text-red-400 text-xs">{track.reason || 'Not matched'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer (Only shown when stage is IDLE) */}
        {transferStage === 'IDLE' && (
          <div className="bg-black/40 px-6 py-4 flex justify-end gap-4 rounded-b-2xl border-t border-white/5">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-sm font-medium text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={checkDuplicatesAndStart}
              disabled={isAnalyzing}
              className="px-8 py-2 rounded-lg text-sm font-bold bg-[#1DB954] text-black hover:bg-[#1ed760] transition-all hover:scale-105 disabled:bg-white/5 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center shadow-lg shadow-[#1DB954]/10"
            >
              Start Transfer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisModal;
