"use client";

import { useState } from "react";
import ImageUpload from "@/app/ui/ImageUpload";
import { Upload } from "lucide-react";

export default function Highlights() {
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaderKey, setUploaderKey] = useState(0);

  const handleImageChange = (info: any) => {
    const val = typeof info === "string" ? info : info?.path ?? info?.url ?? null;
    setImageUrl(val);
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const desc = description.trim();
    if (!desc) {
      alert("La descripción es obligatoria");
      return;
    }
    if (uploading) {
      alert("Espera a que termine la subida de la imagen 🙏");
      return;
    }

    try {
      setSaving(true);
      console.log("[POST] /api/highlights", { description: desc, image_url: imageUrl });
      const res = await fetch("/api/highlights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: desc, image_url: imageUrl ?? null }),
      });

      // para depurar rápido:
      const text = await res.text();
      let json: any = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch {}
      console.log("Respuesta highlights:", res.status, json);

      if (!res.ok) throw new Error(json?.error || `Error ${res.status}`);

      alert("Destacado creado ✅");
      setDescription("");
      setImageUrl(null);
      setUploaderKey((k) => k + 1);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error creando el destacado");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl pt-4 flex flex-col">
      <div className="flex flex-col items-start gap-2">
        <h1 className="text-3xl font-bold">Crear Destacados</h1>
        <p className="text-md text-[var(--color-txt-secondary)]">
          Crea y administra tus ofertas y platos destacados para que se puedan visualizar en el menú del consumidor.
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

        <button
          type="submit"
          disabled={saving || uploading}
          className="p-2 bg-[var(--color-button-send)] text-white rounded-xl ml-2 cursor-pointer disabled:opacity-60 inline-flex items-center justify-center gap-2"
        >
          <Upload />
          {saving ? "Creando..." : uploading ? "Subiendo imagen..." : "Crear"}
        </button>
      </form>
    </div>
  );
}
