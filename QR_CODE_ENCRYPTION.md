# QR Code Encryption Implementation

## Overview
QR codes for PWD members are now **encrypted** to protect member privacy. When scanned with a normal QR scanner app, the data appears as encrypted gibberish. Only the system can decrypt and read the member information.

## How It Works

### 1. **QR Code Generation (Backend)**
- When a QR code is generated for a PWD member, the member data is encrypted using Laravel's `Crypt::encryptString()`
- The encrypted string is stored in the database and encoded in the QR code
- Encryption uses AES-256-CBC (Laravel's default encryption)

### 2. **QR Code Scanning (Frontend)**
- When a QR code is scanned:
  1. First tries to parse as unencrypted JSON (backward compatibility with old QR codes)
  2. If that fails, sends the encrypted data to the backend decryption endpoint
  3. Backend decrypts and validates the data
  4. Returns decrypted member information

### 3. **Backward Compatibility**
- Old unencrypted QR codes will still work
- System automatically detects encrypted vs unencrypted format
- Old QR codes can be regenerated to use encryption

## Security Benefits

✅ **Privacy Protection**: Personal information is not visible when scanned with normal QR scanners
✅ **System-Only Access**: Only your system can decrypt and read the data
✅ **Secure Encryption**: Uses Laravel's built-in encryption (AES-256-CBC)
✅ **Backward Compatible**: Old QR codes still work

## What Users Will See

### Normal QR Scanner App:
```
eyJpdiI6Ik1... (encrypted gibberish)
```

### System Scanner:
- Automatically decrypts
- Shows member information
- Processes benefit claims normally

## Technical Details

### Backend Changes:
- `QRCodeGenerator::generateQRData()` - Now encrypts QR data
- `QRCodeGenerator::decryptQRData()` - Decrypts QR data
- `QRCodeGenerator::validateAndDecryptQRData()` - Validates and decrypts
- New API endpoint: `POST /api/qr-code/decrypt` - Public endpoint for decryption

### Frontend Changes:
- `QRCodeService::generateMemberQRCode()` - Uses encrypted data directly
- `QRCodeService::parseQRCode()` - Now async, handles both encrypted and unencrypted
- QR scanning components updated to use async parseQRCode

## Regenerating QR Codes

To regenerate all QR codes with encryption:

```php
// In Laravel Tinker or Artisan command
$members = \App\Models\PWDMember::whereNotNull('qr_code_generated_at')->get();
foreach ($members as $member) {
    \App\Services\QRCodeGenerator::generateAndStore($member, true);
}
```

Or regenerate individual QR codes through the admin panel.

## Testing

1. **Generate a new QR code** - Should be encrypted
2. **Scan with normal scanner** - Should show encrypted data
3. **Scan with system scanner** - Should decrypt and show member info
4. **Test old QR codes** - Should still work (backward compatibility)

