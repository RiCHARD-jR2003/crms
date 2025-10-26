/**
 * File Storage Utility using IndexedDB
 * Handles persistent file storage across page refreshes
 */

const DB_NAME = 'pwd_application_files';
const DB_VERSION = 1;
const STORE_NAME = 'files';

// Open database connection
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

// Save file to IndexedDB
export const saveFileToStorage = async (fileId, file) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const fileData = await convertFileToBase64(file);
    
    await store.put({
      id: fileId,
      fileData: fileData,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      lastModified: file.lastModified
    });

    return true;
  } catch (error) {
    console.error('Error saving file to IndexedDB:', error);
    return false;
  }
};

// Get file from IndexedDB
export const getFileFromStorage = async (fileId) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(fileId);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve(base64ToFile(result.fileData, result.fileName, result.fileType));
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting file from IndexedDB:', error);
    return null;
  }
};

// Remove file from IndexedDB
export const removeFileFromStorage = async (fileId) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    await store.delete(fileId);
    return true;
  } catch (error) {
    console.error('Error removing file from IndexedDB:', error);
    return false;
  }
};

// Clear all files from IndexedDB
export const clearAllFilesFromStorage = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    await store.clear();
    return true;
  } catch (error) {
    console.error('Error clearing all files from IndexedDB:', error);
    return false;
  }
};

// Convert File to Base64
const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Convert Base64 to File
const base64ToFile = (base64, fileName, mimeType) => {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  const blob = new Blob([ab], { type: mimeType });
  return new File([blob], fileName, { type: mimeType });
};

export default {
  saveFileToStorage,
  getFileFromStorage,
  removeFileFromStorage,
  clearAllFilesFromStorage
};

