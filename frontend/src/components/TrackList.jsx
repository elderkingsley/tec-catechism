import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faMusic, faClock, faUser, faPause } from '@fortawesome/free-solid-svg-icons';

function TrackList({ tracks, currentTrack, onTrackSelect }) {
  
  // Format duration from seconds to MM:SS
  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = (parseInt(bytes) / (1024 * 1024)).toFixed(2);
    return `${mb} MB`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-4 sm:px-6 py-3 sm:py-4">
        <h2 className="text-base sm:text-lg font-semibold text-white flex items-center">
          <FontAwesomeIcon icon={faMusic} className="mr-2" />
          Available Tracks ({tracks.length})
        </h2>
      </div>

      {/* Track List */}
      <div className="divide-y divide-gray-200">
        {tracks.map((track) => {
          const isPlaying = currentTrack?.id === track.id;
          
          return (
            <div
              key={track.id}
              className={`
                px-4 sm:px-6 py-4 hover:bg-blue-50 cursor-pointer transition
                ${isPlaying ? 'bg-blue-100 border-l-4 border-blue-600' : ''}
              `}
              onClick={() => onTrackSelect(track)}
            >
              {/* Mobile Layout (< 640px) */}
              <div className="sm:hidden">
                <div className="flex items-start space-x-3">
                  {/* Play Button (Large touch target) */}
                  <button
                    className={`
                      flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                      transition-all shadow-md
                      ${isPlaying 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600 active:bg-blue-600 active:text-white'
                      }
                    `}
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    <FontAwesomeIcon 
                      icon={isPlaying ? faPause : faPlay} 
                      className={`text-lg ${!isPlaying && 'ml-0.5'}`}
                    />
                  </button>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-base leading-tight mb-1">
                      {track.title}
                    </h3>
                    
                    {track.artist && (
                      <p className="text-sm text-gray-600 flex items-center mb-1">
                        <FontAwesomeIcon icon={faUser} className="mr-1 text-xs" />
                        {track.artist}
                      </p>
                    )}
                    
                    {track.album && (
                      <p className="text-sm text-gray-500 mb-2">
                        {track.album}
                      </p>
                    )}

                    {/* Duration */}
                    <div className="flex items-center text-sm text-gray-500">
                      <FontAwesomeIcon icon={faClock} className="mr-1 text-xs" />
                      {formatDuration(track.duration)}
                      <span className="mx-2">•</span>
                      <span className="text-xs">{formatFileSize(track.file_size)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Layout (>= 640px) */}
              <div className="hidden sm:flex items-center justify-between">
                {/* Left side - Track info */}
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  {/* Play button */}
                  <button
                    className={`
                      flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                      transition-all shadow-md
                      ${isPlaying 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-blue-600 hover:text-white'
                      }
                    `}
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    <FontAwesomeIcon 
                      icon={isPlaying ? faPause : faPlay} 
                      className={`text-lg ${!isPlaying && 'ml-0.5'}`}
                    />
                  </button>

                  {/* Track details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-lg truncate">
                      {track.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      {track.artist && (
                        <span className="flex items-center">
                          <FontAwesomeIcon icon={faUser} className="mr-1 text-xs" />
                          {track.artist}
                        </span>
                      )}
                      {track.album && (
                        <span>• {track.album}</span>
                      )}
                      {track.uploader && (
                        <span className="text-xs">
                          Uploaded by {track.uploader.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side - Duration and file size */}
                <div className="flex items-center space-x-6 text-sm text-gray-600 ml-4">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faClock} className="mr-2" />
                    {formatDuration(track.duration)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatFileSize(track.file_size)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TrackList;
