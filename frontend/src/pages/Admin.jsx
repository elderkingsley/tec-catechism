import { useState, useEffect } from 'react';
import { tracksAPI } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload, 
  faSpinner, 
  faCheckCircle,
  faTrash,
  faMusic,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

function Admin() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [duration, setDuration] = useState('');

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      const response = await tracksAPI.getAll();
      setTracks(response.data);
    } catch (err) {
      console.error('Error fetching tracks:', err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAudioFile(file);

    // Get duration from audio file
    if (file) {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.addEventListener('loadedmetadata', () => {
        setDuration(Math.floor(audio.duration));
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUploadSuccess(false);
    setLoading(true);

    // Validation
    if (!title || !audioFile) {
      setError('Title and audio file are required');
      setLoading(false);
      return;
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('album', album);
    formData.append('audio_file', audioFile);
    if (duration) {
      formData.append('duration', duration);
    }

    try {
      await tracksAPI.create(formData);
      
      // Success - reset form
      setTitle('');
      setArtist('');
      setAlbum('');
      setAudioFile(null);
      setDuration('');
      setUploadSuccess(true);
      
      // Refresh track list
      fetchTracks();
      
      // Clear success message after 5 seconds
      setTimeout(() => setUploadSuccess(false), 5000);
    } catch (err) {
  console.error('Upload error:', err);
  console.error('Error response:', err.response);
  
  let errorMessage = 'Upload failed. ';
  
  if (err.response?.data?.message) {
    errorMessage += err.response.data.message;
  } else if (err.response?.data?.errors) {
    // Validation errors
    const errors = Object.values(err.response.data.errors).flat();
    errorMessage += errors.join(', ');
  } else if (err.message) {
    errorMessage += err.message;
  } else {
    errorMessage += 'Unknown error occurred.';
  }
  
  setError(errorMessage);
} finally {
  setLoading(false);
}
  };

  const handleDelete = async (trackId) => {
    if (!window.confirm('Are you sure you want to delete this track?')) {
      return;
    }

    try {
      await tracksAPI.delete(trackId);
      setTracks(tracks.filter(t => t.id !== trackId));
    } catch (err) {
      alert('Failed to delete track: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Upload and manage catechism audio tracks
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <FontAwesomeIcon icon={faUpload} className="mr-2 text-blue-600" />
            Upload New Track
          </h2>

          {/* Success Message */}
          {uploadSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
              Track uploaded successfully!
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Track title"
                disabled={loading}
              />
            </div>

            {/* Artist */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Artist
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Artist name"
                disabled={loading}
              />
            </div>

            {/* Album */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Album
              </label>
              <input
                type="text"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Album name"
                disabled={loading}
              />
            </div>

            {/* Audio File */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audio File * (MP3, WAV, OGG, M4A, FLAC - Max 2GB)
              </label>
              <input
                type="file"
                accept=".mp3,.wav,.ogg,.m4a,.flac"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              {audioFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {audioFile.name} ({(audioFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faUpload} className="mr-2" />
                  Upload Track
                </>
              )}
            </button>
          </form>
        </div>

        {/* Track Management */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <FontAwesomeIcon icon={faMusic} className="mr-2 text-blue-600" />
            Manage Tracks ({tracks.length})
          </h2>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {tracks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No tracks uploaded yet
              </p>
            ) : (
              tracks.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {track.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {track.artist || 'Unknown Artist'}
                      {track.album && ` • ${track.album}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(track.id)}
                    className="ml-4 text-red-500 hover:text-red-700 transition"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
