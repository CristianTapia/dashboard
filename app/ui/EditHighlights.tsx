"use client";

import { useState, useTransition } from "react";
import ImageUpload from "@/app/ui/ImageUpload";
import { Upload } from "lucide-react";
import { createHighlightAction } from "@/app/dashboard/destacados/actions";

export default function EditHighlights({
  highlightId,
  highlightDescription,
  onCancel,
  onSuccess,
}: {
  highlightId: number;
  highlightDescription: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}) {
  const [description, setDescription] = useState("");
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaderKey, setUploaderKey] = useState(0);
  const [pending, startTransition] = useTransition();

  const saving = pending;

  const handleImageChange = (info: any) => {
    const val = typeof info === "string" ? info : info?.path ?? info?.url ?? null;
    setImagePath(val);
  };

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const desc = description.trim();
    if (!imagePath) return alert("La imagen es obligatoria");
    if (uploading) return alert("Espera a que termine la subida de la imagen");

    startTransition(async () => {
      try {
        const res = await createHighlightAction({ description: desc, image_path: imagePath });
        if (res?.ok) {
          alert("Destacado editado");
          setDescription("");
          setImagePath(null);
          setUploaderKey((k) => k + 1);
        }
      } catch (err: any) {
        alert(err?.message || "Error agregando el destacado");
        console.error(err);
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl flex flex-col">
      <form onSubmit={onSubmit} className="flex flex-col gap-6 mt-6">
        <div className="flex flex-col">
          <div className="flex flex-col gap-6 pb-6">
            <div className="flex flex-col gap-4">
              <p className="dark:text-gray-200 text-sm font-bold leading-normal font-display">Imagen del producto</p>
              <div className="flex items-center gap-4">
                <div className="relative h-24 w-24 flex-shrink-0">
                  <img
                    alt="Product image"
                    className="h-full w-full rounded-lg object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAleaZrCEIT3Ur1vbmHNg8T0kV21f8SFLMZWdKBm7BCVBVBOxS2qNUvWDppzDQTjetzbIj-M9uKgSs0poU6O0X8B4agTf21vlAX6ujJpSXn_-pnfUcazLbHrymGm1KPUtru858H7G3MxTFoyVtdd5OxM0T2UrLC0SSPB0cHiwG5iw4LMCUH_bCJPnV_hecCQQZPcE0-4HAec9BOCEy7EGeK_c_51MRBgLueIW0d1NK3MvNqHCPAo63j97IU0JJXoTIMnR3i1znmNpRd"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <button className="flex h-9 cursor-pointer items-center justify-center overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700 px-3 text-sm font-semibold text-gray-800 dark:text-gray-200 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600">
                    Reemplazar
                  </button>
                  <button className="flex h-9 cursor-pointer items-center justify-center overflow-hidden rounded-md px-3 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
                    Quitar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <label className="text-sm pb-2 font-semibold">Descripción Actual</label>
          <div className="flex w-full items-center rounded-lg border border-gray-300 dark:border-gray-600 bg-[var(--color-cancel)] dark:bg-gray-700/50 p-3 mb-4">
            <p className="text-sm font-normal leading-normal text-gray-500 dark:text-gray-400">
              {highlightDescription}
            </p>
          </div>
          <label className="text-sm pb-2 font-semibold">Nueva Descripción</label>
          <textarea
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-textarea text-sm bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 h-24"
            placeholder="Introduce la descripción del destacado"
            disabled={saving || uploading}
          />
        </div>

        {/* Sube a images/highlights/... */}
        <ImageUpload
          key={uploaderKey}
          folder="highlights"
          onUploaded={handleImageChange}
          onUploadingChange={setUploading}
        />

        {/* Botón para enviar el formulario */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || uploading}
            className="p-3 bg-[var(--color-button-send)] text-white rounded-xl ml-2 cursor-pointer disabled:opacity-60 inline-flex items-center justify-center gap-2 transition"
          >
            <Upload />
            {saving ? "Creando..." : uploading ? "Subiendo imagen..." : "Añadir"}
          </button>
        </div>
      </form>
    </div>
  );
}
