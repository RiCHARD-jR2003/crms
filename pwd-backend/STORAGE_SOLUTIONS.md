# File Storage Solutions Guide

## Problem
Files stored on local filesystem are lost when:
- Server restarts
- Tunnel URL changes
- Deployment to new environment
- Files not accessible via terminal-only access

## Solutions Available

### 1. Database Storage (Recommended for Development)
**Pros:**
- Files persist in database
- Accessible from anywhere
- No external dependencies
- Works with any tunnel URL

**Cons:**
- Database size increases
- Slower for large files (>10MB)
- Not ideal for production with many files

**Setup:**
```env
FILE_STORAGE_METHOD=database
```

**Migration:**
```bash
php artisan migrate
```

### 2. Base64 Database Storage
**Pros:**
- Similar to database storage
- Easy to export/import
- Can be viewed in database directly

**Cons:**
- 33% larger than binary storage
- Same limitations as database storage

**Setup:**
```env
FILE_STORAGE_METHOD=base64
```

### 3. Cloud Storage (AWS S3, Google Cloud, etc.)
**Pros:**
- Scalable
- Persistent across deployments
- CDN support
- Production-ready

**Cons:**
- Requires cloud account
- Additional costs
- External dependency

**Setup:**
```env
FILE_STORAGE_METHOD=s3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-bucket-name
```

### 4. Local Storage (Current - Default)
**Pros:**
- Fast
- No additional setup
- Simple

**Cons:**
- Files lost on restart
- Not accessible via tunnel
- Not portable

**Setup:**
```env
FILE_STORAGE_METHOD=local
```

## Migration from Local to Database

To migrate existing files to database storage:

```bash
php artisan migrate:files-to-database
```

This command will:
1. Find all files in `storage/app/public/uploads/`
2. Store them in the database
3. Update application records to reference database storage

## Usage in Code

### Storing Files
```php
use App\Services\FileStorageService;

// Store file
$result = FileStorageService::storeFile(
    $request->file('document'),
    'uploads/applications/2025/01/01',
    'document.pdf'
);

// Result contains:
// - path: The file path to store in database
// - storage_method: The method used
// - data: Additional metadata
```

### Retrieving Files
```php
// Retrieve file content
$file = FileStorageService::retrieveFile($filePath);

// Returns:
// - content: File binary content
// - mime_type: MIME type
// - size: File size in bytes
```

### Checking File Exists
```php
if (FileStorageService::fileExists($filePath)) {
    // File exists
}
```

## Recommended Setup

### For Development/Testing:
```env
FILE_STORAGE_METHOD=database
```

### For Production:
```env
FILE_STORAGE_METHOD=s3
# Configure AWS credentials
```

## File Size Limits

- **Database Storage**: Recommended for files < 10MB
- **Base64 Storage**: Recommended for files < 5MB
- **S3 Storage**: No practical limit
- **Local Storage**: Limited by disk space

## Backing Up Files

### Database Storage Backup:
```bash
# Backup database (includes files)
mysqldump -u user -p database_name > backup.sql
```

### S3 Storage Backup:
Files are automatically backed up by cloud provider.

## Switching Storage Methods

You can switch storage methods at any time by changing the `FILE_STORAGE_METHOD` environment variable. Existing files will remain in their original storage, but new files will use the new method.

To migrate all files to a new storage method, use the migration command.

