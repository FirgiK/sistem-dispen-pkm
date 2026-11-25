/**
 * Utilitas Kompresi Gambar Otomatis di Browser (Client-Side HTML5 Canvas).
 *
 * Mengurangi ukuran foto kamera HP (biasanya 5MB-10MB) menjadi ~150KB-300KB
 * tanpa mengurangi keterbacaan teks surat/lampiran secara signifikan.
 * Menghemat 95% kuota Supabase Storage Free Tier dan mempercepat upload
 * di zona sinyal lemah Cipatujah.
 */

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
}

export async function compressImage(
  file: File,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.75,
): Promise<CompressionResult> {
  const originalSize = file.size;

  // Jika bukan gambar (misal file PDF) atau sudah sangat kecil (< 150 KB), jangan dikompres ulang
  if (!file.type.startsWith('image/') || originalSize <= 150 * 1024) {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      reductionPercentage: 0,
    };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Hitung skala aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback ke file asli jika context canvas gagal
          resolve({
            file,
            originalSize,
            compressedSize: originalSize,
            reductionPercentage: 0,
          });
          return;
        }

        // Gambar ke canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Export ke JPEG terkompresi
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({
                file,
                originalSize,
                compressedSize: originalSize,
                reductionPercentage: 0,
              });
              return;
            }

            const compressedSize = blob.size;
            const reduction = Math.round(
              ((originalSize - compressedSize) / originalSize) * 100,
            );

            // Buat File object baru
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, '') + '.jpg',
              {
                type: 'image/jpeg',
                lastModified: Date.now(),
              },
            );

            resolve({
              file: compressedFile,
              originalSize,
              compressedSize,
              reductionPercentage: Math.max(0, reduction),
            });
          },
          'image/jpeg',
          quality,
        );
      };

      img.onerror = () => {
        resolve({
          file,
          originalSize,
          compressedSize: originalSize,
          reductionPercentage: 0,
        });
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes ke teks yang mudah dibaca (KB / MB).
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
