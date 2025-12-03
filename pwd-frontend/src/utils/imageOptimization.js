/**
 * Image Optimization Utilities
 * Provides lazy loading, compression, and efficient image handling
 */

import { useState, useEffect } from 'react';

/**
 * Create a lazy loaded image component props
 */
export function getLazyImageProps(src, alt = '', options = {}) {
  const {
    placeholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    loading = 'lazy',
    decoding = 'async',
  } = options;

  return {
    src,
    alt,
    loading,
    decoding,
    onError: (e) => {
      e.target.src = placeholder;
    },
  };
}

/**
 * Preload critical images
 */
export function preloadImages(imageSrcs) {
  imageSrcs.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
}

/**
 * Create optimized image srcset for responsive images
 */
export function createSrcSet(baseSrc, sizes = [320, 640, 960, 1280]) {
  const extension = baseSrc.split('.').pop();
  const baseUrl = baseSrc.replace(`.${extension}`, '');
  
  return sizes
    .map(size => `${baseUrl}-${size}w.${extension} ${size}w`)
    .join(', ');
}

/**
 * Compress image file before upload
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    type = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create a new file with the compressed data
              const compressedFile = new File([blob], file.name, {
                type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          type,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
}

/**
 * Convert image to WebP format (if supported)
 */
export async function convertToWebP(file, quality = 0.8) {
  const supportsWebP = await checkWebPSupport();
  if (!supportsWebP) {
    return file; // Return original if WebP not supported
  }

  return compressImage(file, { type: 'image/webp', quality });
}

/**
 * Check if browser supports WebP
 */
export async function checkWebPSupport() {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width > 0 && img.height > 0);
    img.onerror = () => resolve(false);
    img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
  });
}

/**
 * Get image dimensions without loading full image
 */
export async function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Validate image file
 */
export function validateImageFile(file, options = {}) {
  const {
    maxSizeMB = 5,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    minWidth = 0,
    minHeight = 0,
    maxWidth = Infinity,
    maxHeight = Infinity,
  } = options;

  const errors = [];

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }

  // Check file size
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    errors.push(`File size (${sizeMB.toFixed(2)}MB) exceeds maximum (${maxSizeMB}MB)`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Create thumbnail from image
 */
export async function createThumbnail(file, size = 150) {
  return compressImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
  });
}

/**
 * Progressive image loader
 * Returns a small placeholder first, then loads full image
 */
export function useProgressiveImage(src, placeholder = null) {
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };
  }, [src]);

  return { src: currentSrc, isLoaded };
}

/**
 * Generate blur hash placeholder (simplified version)
 */
export function generatePlaceholder(width = 10, height = 10, color = '#f0f0f0') {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/png');
}

/**
 * Optimize file upload with chunking for large files
 */
export async function uploadWithChunks(file, uploadUrl, options = {}) {
  const {
    chunkSize = 1024 * 1024, // 1MB chunks
    onProgress = null,
  } = options;

  const totalChunks = Math.ceil(file.size / chunkSize);
  const uploadedChunks = [];

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkIndex', i);
    formData.append('totalChunks', totalChunks);
    formData.append('fileName', file.name);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload chunk ${i}`);
    }

    uploadedChunks.push(i);

    if (onProgress) {
      onProgress((uploadedChunks.length / totalChunks) * 100);
    }
  }

  return { success: true, fileName: file.name };
}

export default {
  getLazyImageProps,
  preloadImages,
  createSrcSet,
  compressImage,
  convertToWebP,
  checkWebPSupport,
  getImageDimensions,
  validateImageFile,
  createThumbnail,
  useProgressiveImage,
  generatePlaceholder,
  uploadWithChunks,
};

