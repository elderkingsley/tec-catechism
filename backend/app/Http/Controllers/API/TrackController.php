<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Track;
use App\Services\BunnyService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;

class TrackController extends Controller
{
    protected BunnyService $bunnyService;

    /**
     * Inject BunnyService via dependency injection
     */
    public function __construct(BunnyService $bunnyService)
    {
        $this->bunnyService = $bunnyService;
    }

    /**
     * Get all tracks (public - no auth needed)
     *
     * GET /api/tracks
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        // Get all tracks with uploader info, ordered by lesson number.
        $tracks = Track::with('uploader:id,name')
            ->orderByRaw("CAST(REGEXP_SUBSTR(title, '[0-9]+') AS UNSIGNED) IS NULL")
            ->orderByRaw("CAST(REGEXP_SUBSTR(title, '[0-9]+') AS UNSIGNED)")
            ->orderBy('title')
            ->orderBy('id')
            ->get();

        return response()->json($tracks);
    }

    /**
     * Upload a new track (admin only)
     *
     * POST /api/tracks
     * Body: { title, artist?, album?, audio_file, duration? }
     * Headers: { Authorization: Bearer {token} }
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        // Check if user is admin
        if (!$request->user()->is_admin) {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        // Validate incoming request
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'artist' => 'nullable|string|max:255',
            'album' => 'nullable|string|max:255',
            'audio_file' => 'required|file|mimes:mp3,wav,ogg,m4a,flac|max:2097152', // Max 2GB (2048MB * 1024KB)
            'duration' => 'nullable|integer|min:0',
        ]);

        try {
            $file = $request->file('audio_file');

            // Generate unique filename to prevent collisions
            $uniqueId = Str::uuid();
            $originalName = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $filename = $uniqueId . '_' . $originalName;
            $path = 'tracks/' . $filename;

            // Upload to Bunny.net
            $uploadResult = $this->bunnyService->uploadFile($file, $path);

            if (!$uploadResult['success']) {
                return response()->json([
                    'message' => 'Upload failed',
                    'error' => $uploadResult['error']
                ], 500);
            }

            // Save track metadata to database
            $track = Track::create([
                'title' => $validated['title'],
                'artist' => $validated['artist'] ?? null,
                'album' => $validated['album'] ?? null,
                'bunny_url' => $uploadResult['url'],
                'bunny_file_name' => $filename,
                'file_size' => (string) $uploadResult['size'],
                'duration' => $validated['duration'] ?? null,
                'uploaded_by' => $request->user()->id,
            ]);

            // Load uploader relationship for response
            $track->load('uploader:id,name');

            return response()->json([
                'message' => 'Track uploaded successfully',
                'track' => $track
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred during upload',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update track metadata (admin only)
     *
     * PUT /api/tracks/{track}
     * Body: { title?, artist?, album? }
     * Headers: { Authorization: Bearer {token} }
     *
     * @param Request $request
     * @param Track $track
     * @return JsonResponse
     */
    public function update(Request $request, Track $track): JsonResponse
    {
        // Check if user is admin
        if (!$request->user()->is_admin) {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        // Validate incoming request
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'artist' => 'nullable|string|max:255',
            'album' => 'nullable|string|max:255',
        ]);

        // Update only provided fields
        $track->update($validated);

        // Reload to get fresh data
        $track->load('uploader:id,name');

        return response()->json([
            'message' => 'Track updated successfully',
            'track' => $track
        ]);
    }

    /**
     * Delete a track (admin only)
     *
     * DELETE /api/tracks/{track}
     * Headers: { Authorization: Bearer {token} }
     *
     * @param Request $request
     * @param Track $track
     * @return JsonResponse
     */
    public function destroy(Request $request, Track $track): JsonResponse
    {
        // Check if user is admin
        if (!$request->user()->is_admin) {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        try {
            // Delete file from Bunny.net first
            $path = 'tracks/' . $track->bunny_file_name;
            $deleted = $this->bunnyService->deleteFile($path);

            if (!$deleted) {
                return response()->json([
                    'message' => 'Failed to delete file from storage. Track not removed.'
                ], 500);
            }

            // Delete from database
            $track->delete();

            return response()->json([
                'message' => 'Track deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred during deletion',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
