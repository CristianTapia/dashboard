"use client";

import { useState, useTransition } from "react";
import ImageUpload from "@/app/ui/ImageUpload";
import { Upload } from "lucide-react";
import { createHighlightAction } from "@/app/dashboard/destacados/actions";

export default function AddHighlights() {
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
        }
      } catch (err: any) {
        alert(err?.message || "Error agregando el destacado");
        console.error(err);
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl pt-4 flex flex-col">
      <div className="flex flex-col items-start gap-2">
        <h1 className="text-3xl font-bold">Añadir Destacados</h1>
        <p className="text-md text-[var(--color-txt-secondary)]">
          Agrega nuevas ofertas y/o productos destacados. Se visualizarán inmediatamente en el menú.
        </p>
      </div>

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
