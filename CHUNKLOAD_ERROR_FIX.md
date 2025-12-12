# Fix ChunkLoadError - Frontend Chunk Loading Issues

## Quick Fix (Try This First):

### 1. Clear Browser Cache and Hard Refresh
- **Chrome/Edge**: Press `Ctrl + Shift + Delete` → Clear cached images and files → Clear data
- **Or Hard Refresh**: Press `Ctrl + F5` or `Ctrl + Shift + R`
- **Or**: Open DevTools (F12) → Right-click refresh button → "Empty Cache and Hard Reload"

### 2. Clear Service Worker Cache
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Service Workers** in left sidebar
4. Click **Unregister** for any registered service workers
5. Go to **Cache Storage** → Delete all caches
6. Refresh the page

### 3. If Still Not Working - Rebuild Frontend

```powershell
cd "C:\Users\Ivan\Desktop\New folder\crms\pwd-frontend"

# Clear build cache
Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# Rebuild
npm run build

# Restart the dev server
npm start
```

## Why This Happens:

1. **Stale Cache**: Browser cached old chunk references
2. **Service Worker**: Serving outdated chunks
3. **Build Mismatch**: Frontend was rebuilt but browser has old HTML
4. **Development vs Production**: Mixing dev and production builds

## Prevention:

- Always hard refresh after rebuilding
- Clear service worker when updating
- Use incognito/private mode for testing

