export const compressImage = (file: File, type: 'cover' | 'defect' = 'defect'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // VERSCHIL IN KWALITEIT EN GROOTTE
        // Cover: 2500px voor scherpe A4 weergave
        // Defect: 1200px is ruim voldoende voor kleine foto's in tabel
        const MAX_WIDTH = type === 'cover' ? 2500 : 1200;
        const MAX_HEIGHT = type === 'cover' ? 2500 : 1200;
        const QUALITY = type === 'cover' ? 0.90 : 0.70;
        
        let width = img.width;
        let height = img.height;

        // Bereken nieuwe afmetingen met behoud van aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', QUALITY);
          resolve(dataUrl);
        } else {
          reject(new Error('Canvas context not available'));
        }
      };
      
      img.onerror = (error) => reject(error);
    };
    
    reader.onerror = (error) => reject(error);
  });
};