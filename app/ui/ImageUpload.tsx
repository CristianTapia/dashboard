"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { ImageUp, Trash2, RefreshCw, Loader2 } from "lucide-react";

type Props = {
  onUploaded?: (path: string | null) => void;
  onUploadingChange?: (v: boolean) => void;
  initialPath?: string | null;
};

export default function ImageInput({ onUploaded, onUploadingChange, initialPath = null }: Props) {
  const iconSize = 16;

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(initialPath);
  const [uploading, setUploading] = useState(false);

  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    fetchSigned(initialPath).catch(() => setImagePreview(null));
  }, [initialPath]);

  const clearImage = () => {
    setImagePath(null);
    setImagePreview(null);
    onUploaded?.(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="sm:col-span-4 pb-4">
      {/* input único */}
      <input
        id={inputId}
        ref={fileInputRef}
        type="file"
        name="imageUpload"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        disabled={uploading}
      />

      <div className="col-span-full">
        <label className="block text-sm font-md font-semibold">Imagen</label>

        {/* Marco con tamaño fijo */}
        <div
          className="
            group mt-2 relative flex items-center justify-center
            h-[180px] overflow-hidden rounded-lg
            border-2 border-dashed border-[var(--color-border-box)]
            bg-gray-50 dark:bg-neutral-900/30
          "
        >
          {imagePreview ? (
            <Image
              src={imagePreview}
              alt="Previsualización de la imagen"
              fill
              sizes="(max-width: 640px) 100vw, 640px"
              className="object-contain"
              unoptimized
              priority={false}
            />
          ) : (
            <div className="text-center px-6">
              <ImageUp className="mx-auto" size={54} color="#82858a" />
              <div className="mt-4 flex text-sm/6 text-gray-400">
                <label
                  htmlFor={inputId}
                  className={`
                    transition relative cursor-pointer rounded-md bg-transparent font-semibold
                    text-[var(--color-txt-selected)] focus-within:outline-2 focus-within:outline-offset-2
                    ${uploading ? "opacity-60 pointer-events-none" : "hover:text-[#61A7ED]"}
                  `}
                >
                  <span>{uploading ? "Subiendo..." : "Sube una imagen"}</span>
                </label>
                <p className="pl-1 text-[var(--color-txt-secondary)]">o arrástrala aquí</p>
              </div>
              <p className="text-xs text-gray-400">PNG, JPG, GIF hasta 2MB</p>
            </div>
          )}
        </div>
      </div>

      {/* Barra inferior: solo cuando hay imagen */}
      {imagePreview && (
        <div className="flex items-center justify-end gap-2 mt-2">
          <label
            htmlFor={inputId}
            className={`
              cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium
              rounded-md border shadow-sm
              text-text-light dark:text-text-dark bg-[var(--color-foreground)] dark:bg-surface-dark
              border-[var(--color-border-box)] dark:border-border-dark
              ${
                uploading
                  ? "bg-[var(--color-foreground)] opacity-60 pointer-events-none"
                  : "hover:bg-[var(--color-background)] dark:hover:bg-background-dark"
              }
            `}
          >
            {uploading ? (
              <>
                <Loader2 size={iconSize} className="animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                <RefreshCw size={iconSize} />
                Reemplazar
              </>
            )}
          </label>

          <button
            type="button"
            onClick={clearImage}
            disabled={uploading}
            className={`
              cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border shadow-sm
              ${
                uploading
                  ? "text-red-400 bg-red-50/60 border-red-200/60 cursor-not-allowed"
                  : "text-[#DC2626] dark:text-[#DC2626] bg-[#FEF2F2] dark:bg-red-900/20 border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/30"
              }
            `}
          >
            <Trash2 size={iconSize} /> Quitar
          </button>
        </div>
      )}
    </div>
  );
}
