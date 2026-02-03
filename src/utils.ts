// src/utils.ts
import { supabase } from './supabase';

export const compressImage = async (file: File, type: 'cover' | 'defect'): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize logica (Cover mag groter zijn dan defect foto's)
        const MAX_WIDTH = type === 'cover' ? 1200 : 800;
        const MAX_HEIGHT = type === 'cover' ? 1200 : 800;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Omzetten naar Blob/File i.p.v. Base64 string
        canvas.toBlob((blob) => {
            if (blob) {
                const newFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });
                resolve(newFile);
            } else {
                reject(new Error('Compressie mislukt'));
            }
        }, 'image/jpeg', 0.7); // 70% kwaliteit
      };
      img.onerror = (error) => reject(error);
    };
  });
};

// NIEUWE FUNCTIE: Upload naar Supabase Storage
export const uploadPhotoToCloud = async (file: File): Promise<string | null> => {
    try {
        // 1. Unieke bestandsnaam maken (voorkomt overschrijven)
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `${fileName}`;

        // 2. Uploaden naar bucket 'inspection-images'
        const { error: uploadError } = await supabase.storage
            .from('inspection-images')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Upload error:', uploadError);
            alert("Fout bij uploaden foto: " + uploadError.message);
            return null;
        }

        // 3. Publieke URL ophalen
        const { data } = supabase.storage
            .from('inspection-images')
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (e) {
        console.error("Onverwachte fout:", e);
        return null;
    }
};