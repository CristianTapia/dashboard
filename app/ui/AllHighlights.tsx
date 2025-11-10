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
        <h1 className="text-3xl font-bold">Todos los Destacados</h1>
        <p className="text-md text-[var(--color-txt-secondary)]">
          Visualiza las ofertas y destacados existentes. Los cambios se reflejarán inmediatamente en el menú.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-card overflow-hidden flex flex-col">
          <div className="relative">
            <img
              alt="Elegancia en Acero Inoxidable"
              className="w-full h-48 object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDK1_yG3f_rHpH6jJbRIHwz4vsHhcEstnV6x7OTAK9mMZg4JPYackyCxHWPH6UPvIkxGlDg3_2Ck7FPx6cHa2wssVZdpEXd4uKSzQn9KljMs96F5tmsA_4wCLFhF1AhUTZnKr7XmM-OtidSIfgnWmd7F-U2ryVTPbKv8KPEkQ66L-nays4WH3l9uzDfc24SExRGwqaHQ1tAVc0_kSfRacx2cGCnXhg04YShIprmi-CMc9rM-ZJP4o_HrlzSYo3tRXAjp60JmQr9Pd5T"
            />
          </div>
          <div className="p-4 flex flex-col flex-grow">
            <h3 className="text-md font-bold text-text-light dark:text-text-dark">Happy Lunes</h3>
            <p className="mt-1 text-sm text-text-light/70 dark:text-text-dark/70 flex-grow">
              Todos los lunes descuentos del 20% para clientes frecuentes en todos nuestros platillos.
            </p>
            <div className="mt-4 pt-4 border-t border-[var(--color-border-box)] dark:border-border-dark flex items-center justify-end gap-2">
              <button className="p-2 rounded-md text-text-light/70 dark:text-text-dark/70 hover:bg-background-light dark:hover:bg-background-dark hover:text-text-light dark:hover:text-text-dark transition-colors">
                <span className="material-symbols-outlined text-xl">edit</span>
              </button>
              <button className="p-2 rounded-md text-red-500/80 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-500 transition-colors">
                <span className="material-symbols-outlined text-xl">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
