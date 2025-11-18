"use client";

import { useState, useTransition } from "react";
import ImageUpload from "@/app/ui/ImageUpload";
import { Upload } from "lucide-react";
import { createHighlightAction } from "@/app/dashboard/destacados/actions";

export default function AddHighlights({ onSuccess, onCancel }: { onSuccess?: () => void; onCancel?: () => void }) {
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
    if (!desc) return alert("La descripción es obligatoria");
    if (!imagePath) return alert("La imagen es obligatoria");
    if (uploading) return alert("Espera a que termine la subida de la imagen");

    startTransition(async () => {
      try {
        const res = await createHighlightAction({ description: desc, image_path: imagePath });
        if (res?.ok) {
          alert("Destacado creado.");
          setDescription("");
          setImagePath(null);
          setUploaderKey((k) => k + 1);
          onSuccess?.();
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
          <label className="text-sm pb-2 font-semibold">Descripción *</label>
          <textarea
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-textarea bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 h-24"
            placeholder="Ej: 2x1 en pizzas este fin de semana"
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
        <div className="flex gap-4 px-4 text-sm font-bold justify-center">
          <button
            type="button"
            onClick={onCancel}
            className="flex px-4 p-3 gap-2 rounded-xl cursor-pointer bg-[var(--color-cancel)] text-black hover:bg-[var(--color-cancel-hover)]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="flex px-4 p-3 gap-2 rounded-xl cursor-pointer bg-[var(--color-button-send)] text-white
                       disabled:opacity-60 items-center justify-center transition font-bold hover:bg-[var(--color-button-send-hover)]"
          >
            {saving ? "Creando..." : uploading ? "Subiendo imagen..." : "Añadir"}
          </button>
        </div>
      </form>
    </div>
  );
}
