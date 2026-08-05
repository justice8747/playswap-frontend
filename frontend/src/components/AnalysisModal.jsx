import LoadingSpinner from './common/LoadingSpinner';
import { useState } from 'react';
import { X, AlertTriangle, CheckCircle, Percent, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AnalysisModal = ({ onClose, analysisResult, playlists, sessionId, source, target }) => {
  const [loading, setLoading] = useState(false);
  const isAnalyzing = !analysisResult;
  const navigate = useNavigate();

  const spotifyLogo =
    'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg';
  const ytMusicLogo =
    'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg';

  const sourceLogo = source === 'spotify' ? spotifyLogo : ytMusicLogo;
  const targetLogo = source === 'spotify' ? ytMusicLogo : spotifyLogo;

  const StatsCard = ({ icon, label, value, colorClass }) => (
    <div className={`bg-slate-800/50 p-4 rounded-lg flex items-center`}>
      <div className={`mr-4 p-2 rounded-full ${colorClass || 'bg-slate-700'}`}>{icon}</div>
      <div>
        <div className="text-sm text-gray-400 font-medium">{label}</div>
        <div className="text-xl font-bold text-white">{value}</div>
      </div>
    </div>
  );

  const startTransfer = async () => {
    try {
      const sourcekey = source === 'spotify' ? 'spotify' : 'ytmusic';
      const playlistNames = playlists.map((p) => p.name);
      console.log(sessionId);
      const reqData = {
        playlistNames,
        sessionId,
        sourcekey,
      };
      setLoading(true);
      const res = await fetch(`http://localhost:3000/api/${sourcekey}/execute/transfer`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqData),
      });

      if (res.ok) {
        const data = await res.json();
        console.log('tranfer successful..', data);
        navigate('/transfer-success');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error starting analysis:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-[#121212] border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl m-4 animate-fade-in-up">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Analysis Report</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
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
              {analysisResult.missingTracks &&
                analysisResult.missingTracks.length > 0 && (
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
                              <tr
                                key={index}
                                className="border-b border-white/5 hover:bg-white/5"
                              >
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
        </div>
        <div className="bg-black/40 px-6 py-4 flex justify-end gap-4 rounded-b-2xl border-t border-white/5">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-sm font-medium text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={startTransfer}
            disabled={isAnalyzing || loading}
            className="px-8 py-2 rounded-lg text-sm font-bold bg-[#1DB954] text-black hover:bg-[#1ed760] transition-all hover:scale-105 disabled:bg-white/5 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center shadow-lg shadow-[#1DB954]/10"
          >
            {loading ? (
              <>
                <LoadingSpinner /> Transferring...
              </>
            ) : (
              'Start Transfer'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;
