import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
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
 * Uploads an image to Firebase Storage and returns its public download URL.
 */
export const uploadImage = async (file: File, folder: string): Promise<string> => {
  const compressedFile = await compressImage(file);
  const ext = compressedFile.name.split(".").pop();
  const filename = `${Date.now()}_${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const storageRef = ref(storage, `${folder}/${filename}`);

  await uploadBytes(storageRef, compressedFile);
  return await getDownloadURL(storageRef);
};

/**
 * Deletes an image from Firebase Storage by its Download URL.
 */
export const deleteImage = async (url: string) => {
  if (!url || !url.includes("firebasestorage.googleapis.com")) return;
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Failed to delete image: ", error);
  }
};
