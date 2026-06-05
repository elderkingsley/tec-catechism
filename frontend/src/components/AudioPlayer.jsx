import { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, 
  faPause, 
  faVolumeHigh, 
  faVolumeLow, 
  faVolumeXmark,
  faXmark,
  faForward,
  faBackward 
} from '@fortawesome/free-solid-svg-icons';

function AudioPlayer({ track, onClose, tracks, onTrackChange }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Load and play new track when track changes
  useEffect(() => {
    if (audioRef.current && track) {
      audioRef.current.load();
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error('Playback failed:', err));
    }
  }, [track]);

  // Update current time as audio plays
  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  // Set duration when metadata loads
  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Seek to specific time
  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  // Change volume
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  // Toggle mute
  const toggleMute = () => {
    setShowVolumeSlider(!showVolumeSlider);
  };

  // Skip forward 15 seconds
  const skipForward = () => {
    const newTime = Math.min(audioRef.current.currentTime + 15, duration);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Skip backward 15 seconds
  const skipBackward = () => {
    const newTime = Math.max(audioRef.current.currentTime - 15, 0);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Format time (seconds to MM:SS)
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get volume icon based on volume level
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return faVolumeXmark;
    if (volume < 0.5) return faVolumeLow;
    return faVolumeHigh;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t-2 border-blue-600 z-50">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      >
        <source src={track.bunny_url} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <div className="container mx-auto px-4 py-3 sm:py-4">
        {/* Track Info */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="font-semibold text-gray-800 text-base sm:text-lg truncate">
              {track.title}
            </h3>
            {track.artist && (
              <p className="text-sm text-gray-500 truncate">{track.artist}</p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition p-2 -mr-2"
            aria-label="Close player"
          >
            <FontAwesomeIcon icon={faXmark} className="text-xl" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center space-x-2 sm:space-x-3 mb-3">
          <span className="text-xs sm:text-sm text-gray-600 w-10 sm:w-12 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            style={{
              background: `linear-gradient(to right, #2563eb ${(currentTime / duration) * 100}%, #e5e7eb ${(currentTime / duration) * 100}%)`
            }}
          />
          <span className="text-xs sm:text-sm text-gray-600 w-10 sm:w-12">
            {formatTime(duration)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 sm:space-x-6">
          {/* Skip Backward Button (Mobile-friendly size) */}
          <button
            onClick={skipBackward}
            className="text-gray-600 hover:text-blue-600 transition p-2"
            aria-label="Skip backward 15 seconds"
          >
            <FontAwesomeIcon icon={faBackward} className="text-lg sm:text-xl" />
            <span className="text-xs ml-1">15s</span>
          </button>

          {/* Play/Pause Button (Large touch target) */}
          <button
            onClick={togglePlay}
            className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            <FontAwesomeIcon 
              icon={isPlaying ? faPause : faPlay} 
              className={`text-xl sm:text-2xl ${!isPlaying && 'ml-1'}`} 
            />
          </button>

          {/* Skip Forward Button (Mobile-friendly size) */}
          <button
            onClick={skipForward}
            className="text-gray-600 hover:text-blue-600 transition p-2"
            aria-label="Skip forward 15 seconds"
          >
            <FontAwesomeIcon icon={faForward} className="text-lg sm:text-xl" />
            <span className="text-xs ml-1">15s</span>
          </button>

          {/* Volume Control (Desktop only) */}
          <div className="hidden md:flex items-center space-x-3 relative">
            <button
              onClick={toggleMute}
              className="text-gray-600 hover:text-blue-600 transition p-2"
              aria-label="Toggle volume"
            >
              <FontAwesomeIcon icon={getVolumeIcon()} className="text-lg" />
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Volume Control (Mobile - Popup) */}
          <div className="md:hidden relative">
            <button
              onClick={toggleMute}
              className="text-gray-600 hover:text-blue-600 transition p-2"
              aria-label="Toggle volume"
            >
              <FontAwesomeIcon icon={getVolumeIcon()} className="text-lg" />
            </button>

            {/* Mobile Volume Slider Popup */}
            {showVolumeSlider && (
              <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl p-4 border border-gray-200">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-32 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600 transform rotate-0"
                  orient="vertical"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AudioPlayer;
