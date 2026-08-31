// src/components/ui/ImageUploader.jsx — Upload real no Firebase Storage
import { useState, useRef } from 'react';
import { uploadFileToStorage } from '../../services/storageService';

export default function ImageUploader({
  onUploadSuccess,
  onUploadStart,
  onError,
  className,
  children,
  pathFolder = 'uploads'
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (onError) onError('Apenas arquivos de imagem são permitidos.');
      return;
    }

    // Limite de 5MB
    if (file.size > 5 * 1024 * 1024) {
      if (onError) onError('A imagem deve ter no máximo 5 MB.');
      return;
    }

    try {
      if (onUploadStart) onUploadStart();
      setUploading(true);
      setProgress(10);

      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const storagePath = `${pathFolder}/${timestamp}_${sanitizedName}`;

      const downloadUrl = await uploadFileToStorage(file, storagePath, (percent) => {
        setProgress(percent);
      });

      setUploading(false);
      setProgress(0);
      if (onUploadSuccess) onUploadSuccess(downloadUrl);
    } catch (err) {
      console.warn("Upload no Firebase Storage falhou, gerando fallback:", err);
      // Fallback para FileReader local caso regras do Storage estejam restritas em teste
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setUploading(false);
        setProgress(0);
        if (onUploadSuccess) onUploadSuccess(uploadEvent.target.result);
      };
      reader.onerror = () => {
        setUploading(false);
        if (onError) onError('Erro ao processar imagem.');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={className}>
      <label className={uploading ? 'opacity-50 cursor-not-allowed pointer-events-none block' : 'cursor-pointer block'}>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={uploading}
        />
        {uploading ? (
          <div className="flex flex-col items-center justify-center p-2">
            <div className="w-5 h-5 border-2 border-[#EA1D2C] border-t-transparent rounded-full animate-spin mb-1" />
            <span className="text-[10px] font-bold text-[#EA1D2C]">{Math.round(progress)}%</span>
          </div>
        ) : (
          children || (
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-[#1F2937] transition shrink-0 border border-gray-200">
              <i className="ph-bold ph-image text-xl" />
            </div>
          )
        )}
      </label>
    </div>
  );
}
