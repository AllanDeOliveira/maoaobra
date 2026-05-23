import { useState, useRef } from 'react';
import { storage } from '../../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function ImageUploader({ onUploadSuccess, onUploadStart, onError, className, children, pathFolder = 'uploads' }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (onError) onError('Apenas imagens são permitidas.');
      return;
    }

    if (onUploadStart) onUploadStart();
    setUploading(true);

    const reader = new FileReader();
    reader.onloadstart = () => setProgress(25);
    reader.onprogress = (e) => {
      if (e.lengthComputable) setProgress(25 + (e.loaded / e.total) * 50);
    };
    reader.onload = (e) => {
      setProgress(100);
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
        if (onUploadSuccess) onUploadSuccess(e.target.result);
      }, 500); // give time to show 100%
    };
    reader.onerror = () => {
      setUploading(false);
      if (onError) onError('Erro ao ler a imagem');
    };
    
    // Simulate slight delay for better UX
    setTimeout(() => {
      reader.readAsDataURL(file);
    }, 500);
  };

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <div onClick={() => !uploading && fileInputRef.current?.click()} className={uploading ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}>
        {uploading ? (
          <div className="flex flex-col items-center justify-center p-2">
            <div className="w-5 h-5 border-2 border-[#EA1D2C] border-t-transparent rounded-full animate-spin mb-1" />
            <span className="text-[10px] font-bold text-[#EA1D2C]">{Math.round(progress)}%</span>
          </div>
        ) : (
          children || (
             <button type="button" className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-[#1F2937] transition shrink-0 border border-gray-200">
                <i className="ph-bold ph-image text-xl" />
             </button>
          )
        )}
      </div>
    </div>
  );
}
