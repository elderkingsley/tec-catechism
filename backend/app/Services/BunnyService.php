<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\UploadedFile;
use Illuminate\Http\Client\Response;
use Illuminate\Http\Client\PendingRequest;

class BunnyService
{
    protected string $storageZoneName;
    protected string $apiKey;
    protected string $hostname;
    protected string $region;

    /**
     * Initialize Bunny.net configuration
     */
    public function __construct()
    {
        $this->storageZoneName = config('services.bunny.storage_zone_name', '');
        $this->apiKey = config('services.bunny.api_key', '');
        $this->hostname = config('services.bunny.hostname', '');
        $this->region = config('services.bunny.region', 'de');
    }

    /**
     * Upload a file to Bunny.net Storage
     * 
     * @param UploadedFile $file - The uploaded audio file
     * @param string $path - Path where to store (e.g., 'tracks/song.mp3')
     * @return array - Contains success status, URL, filename, size
     */
    public function uploadFile(UploadedFile $file, string $path): array
    {
        try {
            // Build the full upload URL
            $uploadUrl = "https://storage.bunnycdn.com/{$this->storageZoneName}/{$path}";

            // Read file contents
            $fileContents = file_get_contents($file->getRealPath());

            if ($fileContents === false) {
                return [
                    'success' => false,
                    'error' => 'Could not read file contents',
                ];
            }

            // Send PUT request to Bunny.net and wait for response
            /** @var Response $response */
            $response = Http::withHeaders([
                'AccessKey' => $this->apiKey,
                'Content-Type' => 'application/octet-stream',
            ])
            ->timeout(120) // 2 minutes timeout for large files
            ->withBody($fileContents, 'application/octet-stream')
            ->put($uploadUrl);

            // Check if upload was successful
            $statusCode = $response->status();
            
            if ($statusCode >= 200 && $statusCode < 300) {
                // Build the public CDN URL
                $cdnUrl = "https://{$this->hostname}/{$path}";

                return [
                    'success' => true,
                    'url' => $cdnUrl,
                    'filename' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                ];
            }

            // Upload failed - get error details
            $errorMessage = $this->getErrorMessage($response);

            return [
                'success' => false,
                'error' => $errorMessage,
            ];

        } catch (\Exception $e) {
            // Catch any errors
            return [
                'success' => false,
                'error' => 'Exception: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Delete a file from Bunny.net Storage
     * 
     * @param string $path - Path to file (e.g., 'tracks/song.mp3')
     * @return bool - True if deleted successfully
     */
    public function deleteFile(string $path): bool
    {
        try {
            $deleteUrl = "https://storage.bunnycdn.com/{$this->storageZoneName}/{$path}";

            /** @var Response $response */
            $response = Http::withHeaders([
                'AccessKey' => $this->apiKey,
            ])->delete($deleteUrl);

            $statusCode = $response->status();
            return $statusCode >= 200 && $statusCode < 300;

        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get the public CDN URL for a file
     * 
     * @param string $path
     * @return string
     */
    public function getCdnUrl(string $path): string
    {
        return "https://{$this->hostname}/{$path}";
    }

    /**
     * Get a detailed error message from response
     * 
     * @param Response $response
     * @return string
     */
    protected function getErrorMessage(Response $response): string
    {
        $statusCode = $response->status();
        $message = "Upload failed with status: {$statusCode}";

        // Add specific error messages based on status code
        switch ($statusCode) {
            case 401:
                $message .= " - Authentication failed. Check your API key.";
                break;
            case 403:
                $message .= " - Access denied. Check your permissions.";
                break;
            case 404:
                $message .= " - Storage zone not found. Check your storage zone name.";
                break;
            case 413:
                $message .= " - File too large.";
                break;
            case 500:
            case 502:
            case 503:
                $message .= " - Bunny.net server error. Try again later.";
                break;
        }

        // Try to get response body for more details
        try {
            $body = $response->body();
            if (!empty($body) && is_string($body)) {
                $message .= " Response: " . substr($body, 0, 200);
            }
        } catch (\Exception $e) {
            // Ignore if we can't get body
        }

        return $message;
    }
}