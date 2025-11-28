<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\UploadedFile;

class FileStorageService
{
    /**
     * Storage methods
     */
    const STORAGE_LOCAL = 'local';
    const STORAGE_DATABASE = 'database';
    const STORAGE_S3 = 's3';
    const STORAGE_BASE64 = 'base64';

    /**
     * Get the current storage method from environment
     */
    public static function getStorageMethod()
    {
        return env('FILE_STORAGE_METHOD', self::STORAGE_LOCAL);
    }

    /**
     * Store a file using the configured storage method
     * 
     * @param UploadedFile $file
     * @param string $path Path where file should be stored (relative)
     * @param string $fileName Optional custom filename
     * @return array ['path' => string, 'storage_method' => string, 'data' => mixed]
     */
    public static function storeFile(UploadedFile $file, string $path, string $fileName = null)
    {
        $storageMethod = self::getStorageMethod();
        $fileName = $fileName ?: $file->getClientOriginalName();
        $filePath = $path . '/' . $fileName;

        switch ($storageMethod) {
            case self::STORAGE_DATABASE:
                return self::storeInDatabase($file, $filePath);
            
            case self::STORAGE_BASE64:
                return self::storeAsBase64($file, $filePath);
            
            case self::STORAGE_S3:
                return self::storeInS3($file, $filePath);
            
            case self::STORAGE_LOCAL:
            default:
                return self::storeLocally($file, $filePath);
        }
    }

    /**
     * Store file in database as BLOB
     */
    private static function storeInDatabase(UploadedFile $file, string $filePath)
    {
        try {
            $fileContent = file_get_contents($file->getRealPath());
            $mimeType = $file->getMimeType();
            $fileSize = $file->getSize();

            // Store in database
            $id = DB::table('file_storage')->insertGetId([
                'file_path' => $filePath,
                'file_name' => basename($filePath),
                'mime_type' => $mimeType,
                'file_size' => $fileSize,
                'file_content' => $fileContent,
                'storage_method' => self::STORAGE_DATABASE,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return [
                'path' => $filePath,
                'storage_method' => self::STORAGE_DATABASE,
                'data' => ['id' => $id]
            ];
        } catch (\Exception $e) {
            Log::error('Error storing file in database: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Store file as base64 string in database
     */
    private static function storeAsBase64(UploadedFile $file, string $filePath)
    {
        try {
            $fileContent = base64_encode(file_get_contents($file->getRealPath()));
            $mimeType = $file->getMimeType();
            $fileSize = $file->getSize();

            // Store in database
            $id = DB::table('file_storage')->insertGetId([
                'file_path' => $filePath,
                'file_name' => basename($filePath),
                'mime_type' => $mimeType,
                'file_size' => $fileSize,
                'file_content' => $fileContent,
                'storage_method' => self::STORAGE_BASE64,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return [
                'path' => $filePath,
                'storage_method' => self::STORAGE_BASE64,
                'data' => ['id' => $id]
            ];
        } catch (\Exception $e) {
            Log::error('Error storing file as base64: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Store file in S3 or cloud storage
     */
    private static function storeInS3(UploadedFile $file, string $filePath)
    {
        try {
            $storedPath = Storage::disk('s3')->put($filePath, file_get_contents($file->getRealPath()), 'public');
            
            return [
                'path' => $storedPath,
                'storage_method' => self::STORAGE_S3,
                'data' => ['url' => Storage::disk('s3')->url($storedPath)]
            ];
        } catch (\Exception $e) {
            Log::error('Error storing file in S3: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Store file locally (default)
     */
    private static function storeLocally(UploadedFile $file, string $filePath)
    {
        try {
            $storedPath = Storage::disk('public')->putFileAs(
                dirname($filePath),
                $file,
                basename($filePath)
            );

            return [
                'path' => $storedPath,
                'storage_method' => self::STORAGE_LOCAL,
                'data' => ['full_path' => storage_path('app/public/' . $storedPath)]
            ];
        } catch (\Exception $e) {
            Log::error('Error storing file locally: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Retrieve file content
     * 
     * @param string $filePath The stored file path
     * @param string $storageMethod Optional storage method override
     * @return array ['content' => string, 'mime_type' => string, 'size' => int]
     */
    public static function retrieveFile(string $filePath, string $storageMethod = null)
    {
        $storageMethod = $storageMethod ?: self::getStorageMethod();

        switch ($storageMethod) {
            case self::STORAGE_DATABASE:
            case self::STORAGE_BASE64:
                return self::retrieveFromDatabase($filePath, $storageMethod);
            
            case self::STORAGE_S3:
                return self::retrieveFromS3($filePath);
            
            case self::STORAGE_LOCAL:
            default:
                return self::retrieveLocally($filePath);
        }
    }

    /**
     * Retrieve file from database
     */
    private static function retrieveFromDatabase(string $filePath, string $storageMethod)
    {
        $file = DB::table('file_storage')
            ->where('file_path', $filePath)
            ->first();

        if (!$file) {
            throw new \Exception("File not found in database: {$filePath}");
        }

        $content = $file->file_content;
        
        // Decode if stored as base64
        if ($storageMethod === self::STORAGE_BASE64) {
            $content = base64_decode($content);
        }

        return [
            'content' => $content,
            'mime_type' => $file->mime_type,
            'size' => $file->file_size
        ];
    }

    /**
     * Retrieve file from S3
     */
    private static function retrieveFromS3(string $filePath)
    {
        if (!Storage::disk('s3')->exists($filePath)) {
            throw new \Exception("File not found in S3: {$filePath}");
        }

        $content = Storage::disk('s3')->get($filePath);
        $mimeType = Storage::disk('s3')->mimeType($filePath);
        $size = Storage::disk('s3')->size($filePath);

        return [
            'content' => $content,
            'mime_type' => $mimeType,
            'size' => $size
        ];
    }

    /**
     * Retrieve file locally
     */
    private static function retrieveLocally(string $filePath)
    {
        $fullPath = storage_path('app/public/' . $filePath);
        
        if (!file_exists($fullPath)) {
            throw new \Exception("File not found on disk: {$fullPath}");
        }

        return [
            'content' => file_get_contents($fullPath),
            'mime_type' => mime_content_type($fullPath),
            'size' => filesize($fullPath)
        ];
    }

    /**
     * Delete a file
     */
    public static function deleteFile(string $filePath, string $storageMethod = null)
    {
        $storageMethod = $storageMethod ?: self::getStorageMethod();

        switch ($storageMethod) {
            case self::STORAGE_DATABASE:
            case self::STORAGE_BASE64:
                DB::table('file_storage')->where('file_path', $filePath)->delete();
                break;
            
            case self::STORAGE_S3:
                Storage::disk('s3')->delete($filePath);
                break;
            
            case self::STORAGE_LOCAL:
            default:
                Storage::disk('public')->delete($filePath);
                break;
        }
    }

    /**
     * Check if file exists
     */
    public static function fileExists(string $filePath, string $storageMethod = null)
    {
        $storageMethod = $storageMethod ?: self::getStorageMethod();

        switch ($storageMethod) {
            case self::STORAGE_DATABASE:
            case self::STORAGE_BASE64:
                return DB::table('file_storage')->where('file_path', $filePath)->exists();
            
            case self::STORAGE_S3:
                return Storage::disk('s3')->exists($filePath);
            
            case self::STORAGE_LOCAL:
            default:
                return Storage::disk('public')->exists($filePath);
        }
    }
}

