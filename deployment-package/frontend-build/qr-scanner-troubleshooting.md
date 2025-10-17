# QR Scanner Troubleshooting Guide

## 🔍 Issue: QR Scanner Not Scanning

The QR scanner is showing the camera feed but not detecting/scanning QR codes properly.

## 🛠️ Solutions Applied:

### 1. **Improved QR Scanner Configuration**
- ✅ Increased scan frequency from 2 to 10 scans per second
- ✅ Changed preferred camera to 'environment' (back camera)
- ✅ Added detailed scan result logging
- ✅ Improved error handling and debugging

### 2. **Enhanced QR Code Generation**
- ✅ Increased QR code size from 80x80 to 120x120 pixels
- ✅ Added error correction level 'M' for better scanning
- ✅ Improved margin and quality settings
- ✅ Added PNG format with high quality

### 3. **Added Debug Logging**
- ✅ Enhanced console logging with emojis (🎯, 📄, 🔍)
- ✅ Added detailed QR data type and length logging
- ✅ Improved error messages with ✅/❌ indicators

## 🧪 Testing Steps:

### **Step 1: Test with Debug Page**
1. Open: `http://localhost:3000/qr-debug-test.html`
2. Generate test QR codes
3. Try scanning with the PWD system QR scanner
4. Check browser console (F12) for debug messages

### **Step 2: Check Console Logs**
Look for these messages in the browser console:
- `🎯 QR Code scanned:` - QR code detected
- `📄 QR Code data:` - Raw QR data
- `✅ Successfully parsed QR data as JSON:` - Success
- `❌ Failed to parse QR code as JSON:` - Parse error

### **Step 3: Verify QR Code Quality**
- Ensure QR code is well-lit and clear
- Hold QR code steady in camera view
- Make sure QR code is not too small or too large
- Check for glare or reflections on QR code

## 🔧 Common Issues & Fixes:

### **Issue 1: Camera Permissions**
**Symptoms:** Camera not starting or access denied
**Fix:** 
- Allow camera permissions when prompted
- Refresh page and try again
- Check browser settings for camera access

### **Issue 2: QR Code Too Small/Large**
**Symptoms:** Scanner can't detect QR code
**Fix:**
- Hold QR code at appropriate distance (6-12 inches)
- Ensure QR code fills at least 1/4 of camera view
- Use back camera for better focus

### **Issue 3: Poor Lighting**
**Symptoms:** Scanner detects but can't read QR code
**Fix:**
- Ensure good lighting on QR code
- Avoid shadows or glare
- Use device flashlight if needed

### **Issue 4: QR Code Format Issues**
**Symptoms:** Scanner detects but parsing fails
**Fix:**
- Check console logs for parse errors
- Verify QR code contains valid JSON data
- Test with simple text QR codes first

## 📱 Device-Specific Tips:

### **Mobile Devices:**
- Use back camera for better QR scanning
- Hold device steady
- Ensure good lighting
- Allow camera permissions

### **Desktop/Laptop:**
- Use external webcam if built-in camera is poor
- Ensure good lighting
- Position QR code at appropriate distance
- Check camera permissions

## 🐛 Debug Information:

### **Console Commands:**
```javascript
// Check if QR scanner is working
console.log('QR Scanner Status:', scanner);

// Check camera access
navigator.mediaDevices.getUserMedia({video: true})
  .then(stream => console.log('Camera OK'))
  .catch(err => console.log('Camera Error:', err));

// Test QR code generation
QRCode.toDataURL('test', (err, url) => {
  if (err) console.log('QR Generation Error:', err);
  else console.log('QR Generation OK');
});
```

### **Expected Console Output:**
```
🎯 QR Code scanned: {data: "..."}
📄 QR Code data: {"pwd_id":"PWD-2025-000001",...}
🔍 QR Code format: string
✅ Successfully parsed QR data as JSON: {pwd_id: "PWD-2025-000001",...}
```

## 🚀 Next Steps:

1. **Test with debug page** - Use `qr-debug-test.html`
2. **Check console logs** - Look for debug messages
3. **Try different QR codes** - Test with simple text first
4. **Verify camera access** - Ensure permissions are granted
5. **Test on different devices** - Try mobile and desktop

## 📞 Support:

If issues persist:
1. Check browser console for error messages
2. Try different browsers (Chrome, Firefox, Edge)
3. Test on different devices
4. Verify QR code generation is working
5. Check camera permissions and access
