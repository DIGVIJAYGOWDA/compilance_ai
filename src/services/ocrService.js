import Tesseract from 'tesseract.js';

/**
 * Run OCR on an image file
 * @param {File} imageFile
 * @param {Function} onProgress - receives 0-100
 * @returns {{ text, confidence }}
 */
export async function extractTextFromImage(imageFile, onProgress) {
  try {
    const result = await Tesseract.recognize(imageFile, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          onProgress?.(Math.round(m.progress * 100));
        }
      },
    });
    return {
      text: result.data.text,
      confidence: Math.round(result.data.confidence),
      error: null,
    };
  } catch (err) {
    return { text: '', confidence: 0, error: err.message };
  }
}

/**
 * Convert file to base64 preview URL
 */
export function preprocessImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve({ preview: e.target.result, file });
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
