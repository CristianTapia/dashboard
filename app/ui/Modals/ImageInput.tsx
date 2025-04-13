import { useState } from "react";
import Image from "next/image";

export default function ImageInput() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  return (
    <div className="sm:col-span-4 pb-4">
      <label className="text-sm font-medium text-gray-900">Imagen (Opcional)</label>

      {/* Input oculto */}
      <input id="imageUpload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

      {/* Contenedor del botón y nombre del archivo */}
      <div className="flex items-center gap-3 mt-1">
        {/* Label estilo botón */}
        <label
          htmlFor="imageUpload"
          className="cursor-pointer rounded bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700 transition"
        >
          Seleccionar Imagen
        </label>

        {/* Nombre del archivo (opcional) */}
        {imagePreview && <span className="text-sm text-gray-700">Imagen cargada</span>}
      </div>

      {/* Vista previa */}
      {imagePreview && (
        <div className="mt-4">
          <Image
            src={imagePreview}
            alt="Vista previa"
            width={128}
            height={128}
            unoptimized
            className="object-cover rounded border"
          />
        </div>
      )}
    </div>
  );
}
