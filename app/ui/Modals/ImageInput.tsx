"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ImageUp } from "lucide-react";

type Props = {
  onUploaded?: (path: string | null) => void;
  onUploadingChange?: (v: boolean) => void;
  initialPath?: string | null;
};

export default function ImageInput({ onUploaded, onUploadingChange, initialPath = null }: Props) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
    setImagePreview(url);
  }

  async function uploadToServer(file: File) {
    if (!file.type.startsWith("image/")) {
      alert("Solo imagenes");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Maximo 2MB");
      return;
    }

    const fd = new FormData();
    fd.append("file", file);

    try {
      setUploadingSafe(true);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error subiendo imagen");

      setImagePath(json.path);
      onUploaded?.(json.path);
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

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    await uploadToServer(file);
  }

  useEffect(() => {
    if (!initialPath) {
      setImagePath(null);
      setImagePreview(null);
      return;
    }

    setImagePath(initialPath);
    fetchSigned(initialPath).catch((err) => {
      console.error(err);
      setImagePreview(null);
    });
  }, [initialPath]);

  const clearImage = () => {
    setImagePath(null);
    setImagePreview(null);
    onUploaded?.(null);
  };

  return (
    <div className="sm:col-span-4 pb-4">
      <input id="imageUpload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

      <div className="flex items-center gap-3 mt-1">
        <label
          htmlFor="imageUpload"
          className="cursor-pointer rounded bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700 transition"
        >
          {uploading ? "Subiendo..." : "Seleccionar Imagen"}
        </label>

        {imagePath && <span className="text-xs text-gray-600 truncate max-w-[240px]">{imagePath}</span>}

        {imagePath && (
          <button type="button" onClick={clearImage} className="text-xs text-red-600 hover:underline">
            Quitar
          </button>
        )}
      </div>

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
