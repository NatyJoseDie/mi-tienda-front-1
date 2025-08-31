import { useState } from 'react';
import { configuracionAPI } from '@/services/configuracion';

export default function SubirArchivos() {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileUpload = async (file: File, tipo: 'logo' | 'favicon' | 'banner') => {
    if (!file) return;
    
    setUploading(true);
    try {
      let result;
      switch (tipo) {
        case 'logo':
          result = await configuracionAPI.subirLogo(file);
          break;
        case 'favicon':
          result = await configuracionAPI.subirFavicon(file);
          break;
        case 'banner':
          result = await configuracionAPI.subirBanner(file);
          break;
      }
      alert(`${tipo} subido exitosamente`);
    } catch (error) {
      alert(`Error al subir ${tipo}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, tipo: 'logo' | 'favicon' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
      handleFileUpload(file, tipo);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['logo', 'favicon', 'banner'] as const).map((tipo) => (
          <div key={tipo} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 capitalize">{tipo}</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {preview && tipo === 'logo' ? (
                <img src={preview} alt="Preview" className="mx-auto h-20 object-contain mb-4" />
              ) : (
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
              )}
              
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, tipo)}
                className="hidden"
                id={`file-${tipo}`}
                disabled={uploading}
              />
              
              <label
                htmlFor={`file-${tipo}`}
                className={`cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                  uploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors`}
              >
                {uploading ? 'Subiendo...' : `Subir ${tipo}`}
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}