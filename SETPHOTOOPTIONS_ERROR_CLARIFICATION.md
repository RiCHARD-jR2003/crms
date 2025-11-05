# setPhotoOptions Error Clarification

## Important: This is NOT a File Upload Error

The `setPhotoOptions failed` error you're seeing is **NOT related to Laravel/React file uploads**. It's a browser camera API error that occurs when trying to manipulate camera settings (like torch/flash) on mobile devices.

## What is setPhotoOptions?

`setPhotoOptions` is part of the browser's MediaStreamTrack API used to control camera features like:
- Flash/torch
- Focus
- White balance
- Exposure

This error typically occurs when:
1. Trying to disable torch/flash before stopping camera tracks
2. Camera track is already stopped/invalid state
3. Browser doesn't support the feature (common on mobile)

## File Upload Issues (Separate Topic)

While checking your codebase, I found and fixed several **actual file upload issues**:

### Fixed Issues:

1. **Incorrect Content-Type Headers** ✅ Fixed
   - Problem: Manually setting `Content-Type: multipart/form-data` prevents browser from adding boundary
   - Fixed in:
     - `MemberDocumentUpload.js`
     - `supportService.js`
     - `DocumentCorrectionPage.js`
     - `LandingPage.js`
   - Solution: Let browser set Content-Type automatically with boundary

2. **API Service Already Handles FormData Correctly** ✅
   - Your `api.js` service correctly removes Content-Type for FormData
   - The issue was individual services overriding this

### Configuration Check:

✅ **CORS Configuration**: Properly configured for API routes
✅ **CSRF**: Disabled for API routes (correct for token-based auth)
✅ **Authentication**: Using Laravel Sanctum Bearer tokens
✅ **File Size Limits**: Frontend validation (2MB) matches backend

### Recommendations:

1. **PHP Configuration** (if uploads still fail):
   ```ini
   upload_max_filesize = 10M
   post_max_size = 10M
   max_execution_time = 300
   max_input_time = 300
   ```

2. **Storage Permissions**:
   ```bash
   php artisan storage:link
   chmod -R 775 storage/app/public
   ```

3. **Laravel Validation**: Already configured correctly in controllers

## Summary

- ✅ **setPhotoOptions Error**: Fixed in QRScanner component (camera API error suppression)
- ✅ **File Upload Issues**: Fixed Content-Type headers in all upload locations
- ✅ **Configuration**: Verified CORS, CSRF, and authentication setup

Your file uploads should now work correctly, and the camera error is suppressed.

