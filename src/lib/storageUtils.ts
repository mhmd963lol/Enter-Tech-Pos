import { storage } from "./firebase";

/**
 * Compresses an image file natively using HTML Canvas.
 * No external libraries needed.
 */
export const compressImage = async (
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.7
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height *= maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width *= maxHeight / height));
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas parsing failed."));

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Image compression failed."));
            // Force save as jpeg to save space
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, ".jpg"),
              {
                type: "image/jpeg",
                lastModified: Date.now(),
              }
            );
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

/**
 * Converts a File to a Base64 Data URI string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Uploads an image by compressing it extremely well, then converting to Base64.
 * This completely bypasses the need for Firebase Storage manual setup in the console.
 * Firestore supports up to 1MB per document, so this fits perfectly.
 */
export const uploadImage = async (file: File, _folder: string): Promise<string> => {
  // Compress to maximum 400x400 to keep Base64 size tiny (usually under 30KB)
  const compressedFile = await compressImage(file, 400, 400, 0.6);
  return await fileToBase64(compressedFile);
};

/**
 * Empty stub since Base64 strings deleted automatically when document updates/deletes.
 */
export const deleteImage = async (url: string) => {
  // No-op for Base64 encoded images.
  return;
};
