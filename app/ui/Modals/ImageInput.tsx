// import { useState } from "react";
// import Image from "next/image";

// export default function ImageInput() {
//   const [imagePreview, setImagePreview] = useState<string | null>(null);

//   function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
//     const file = e.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   }

//   return (
//     <div className="sm:col-span-4 pb-4">
//       <label className="text-sm font-medium text-gray-900">Imagen (Opcional)</label>

//       {/* Input oculto */}
//       <input id="imageUpload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

//       {/* Contenedor del botón y nombre del archivo */}
//       <div className="flex items-center gap-3 mt-1">
//         {/* Label estilo botón */}
//         <label
//           htmlFor="imageUpload"
//           className="cursor-pointer rounded bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700 transition"
//         >
//           Seleccionar Imagen
//         </label>

//         {/* Nombre del archivo (opcional) */}
//         {imagePreview && <span className="text-sm text-gray-700">Imagen cargada</span>}
//       </div>

//       {/* Vista previa */}
//       {imagePreview && (
//         <div className="mt-4">
//           <Image
//             src={imagePreview}
//             alt="Vista previa"
//             width={128}
//             height={128}
//             unoptimized
//             className="object-cover rounded border"
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// "use client";

// import { useEffect, useState } from "react";

// export default function ImageInput({
//   onUploaded,
//   initialPath,
// }: {
//   onUploaded: (path: string | null) => void;
//   initialPath?: string | null;
// }) {
//   const [file, setFile] = useState<File | null>(null);
//   const [uploading, setUploading] = useState(false);
//   const [imagePath, setImagePath] = useState<string | null>(initialPath ?? null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);

//   const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const f = e.target.files?.[0] ?? null;
//     setFile(f);
//     // preview local opcional:
//     if (f) setPreviewUrl(URL.createObjectURL(f));
//   };

//   const upload = async () => {
//     if (!file) return;
//     const fd = new FormData();
//     fd.append("file", file);

//     try {
//       setUploading(true);
//       const res = await fetch("/api/upload", { method: "POST", body: fd });
//       const json = await res.json();
//       if (!res.ok) throw new Error(json?.error || "Error subiendo imagen");

//       setImagePath(json.path);
//       onUploaded(json.path);
//       // Genera preview firmada (servida)
//       const pre = await fetch(`/api/images/signed?path=${encodeURIComponent(json.path)}`);
//       const { url } = await pre.json();
//       setPreviewUrl(url);
//     } catch (e: any) {
//       alert(e.message);
//       onUploaded(null);
//       setImagePath(null);
//       setPreviewUrl(null);
//     } finally {
//       setUploading(false);
//     }
//   };

//   // Si te pasan un path inicial (editar producto), trae signed URL
//   useEffect(() => {
//     (async () => {
//       if (!imagePath) return;
//       const res = await fetch(`/api/images/signed?path=${encodeURIComponent(imagePath)}`);
//       const { url } = await res.json();
//       setPreviewUrl(url);
//     })();
//   }, [imagePath]);

//   return (
//     <div className="sm:col-span-4 pb-2">
//       <label className="text-sm/6 font-medium text-gray-900">Imagen</label>
//       <div className="flex gap-2 items-center">
//         <input type="file" accept="image/*" onChange={handleFile} />
//         <button
//           type="button"
//           onClick={upload}
//           disabled={!file || uploading}
//           className="rounded bg-indigo-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
//         >
//           {uploading ? "Subiendo..." : "Subir"}
//         </button>
//       </div>

//       {previewUrl && (
//         <div className="mt-2">
//           {/* Puedes reemplazar por <Image /> de Next si configuras remotePatterns */}
//           <img src={previewUrl} alt="preview" className="h-24 rounded border" />
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  // opcionales: si los pasas, informas al padre
  onUploaded?: (path: string | null) => void;
  onUploadingChange?: (v: boolean) => void;
  initialPath?: string | null; // para modo edición
};

export default function ImageInput({ onUploaded, onUploadingChange, initialPath = null }: Props) {
  const [imagePreview, setImagePreview] = useState<string | null>(null); // preview (dataURL o signed URL)
  const [imagePath, setImagePath] = useState<string | null>(initialPath);
  const [uploading, setUploading] = useState(false);

  const setUploadingSafe = (v: boolean) => {
    setUploading(v);
    onUploadingChange?.(v);
  };

  async function fetchSigned(path: string) {
    const r = await fetch(`/api/signed?path=${encodeURIComponent(path)}`);
    const { url, error } = await r.json();
    if (error) throw new Error(error);
    setImagePreview(url); // signed URL para mostrar
  }

  async function uploadToServer(file: File) {
    // Validaciones rápidas
    if (!file.type.startsWith("image/")) {
      alert("Solo imágenes");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Máximo 2MB");
      return;
    }

    const fd = new FormData();
    fd.append("file", file);

    try {
      setUploadingSafe(true);

      // 1) SUBIR a /api/upload → { path }
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error subiendo imagen");

      setImagePath(json.path);
      onUploaded?.(json.path);

      // 2) Pedir signed URL para PREVIEW
      await fetchSigned(json.path);
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Error subiendo imagen");
      setImagePath(null);
      onUploaded?.(null);
      setImagePreview(null);
    } finally {
      setUploadingSafe(false);
    }
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview local instantánea (opcional, mientras sube)
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    // SUBIR al server (privado)
    await uploadToServer(file);
  }

  return (
    <div className="sm:col-span-4 pb-4">
      <label className="text-sm font-medium text-gray-900">Imagen (Opcional)</label>

      {/* Input oculto */}
      <input id="imageUpload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

      {/* Botón seleccionar */}
      <div className="flex items-center gap-3 mt-1">
        <label
          htmlFor="imageUpload"
          className="cursor-pointer rounded bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700 transition"
        >
          {uploading ? "Subiendo..." : "Seleccionar Imagen"}
        </label>

        {imagePath && <span className="text-xs text-gray-600 truncate max-w-[240px]">{imagePath}</span>}
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
