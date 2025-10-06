import ImageUpload from "@/app/ui/ImageUpload";
import { ImageUp } from "lucide-react";

export default function Highlights() {
  return (
    <div className="mx-auto max-w-3xl pt-4 flex flex-col">
      <div className="flex flex-col items-start gap-2">
        <h1 className="text-3xl font-bold">Crear Destacados</h1>
        <p className="text-md text-[var(--color-txt-secondary)]">
          Crea y administra tus ofertas y platos destacados para que se puedan visualizar en el menú del consumidor.
        </p>
      </div>

      <form className="flex flex-col gap-6 mt-6">
        {/* Description */}
        <div className="flex flex-col">
          <label className="text-sm pb-2 font-semibold">Descripción *</label>
          <textarea
            name="description"
            // type="text"
            // value="{form.description}"
            className="form-textarea bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 h-24"
            // onChange="{handleChange}"
          />
        </div>

        {/* Imagen */}
        <ImageUpload />

        {/* Send form button */}
        <button type="button" className="p-2 bg-[var(--color-button-send)] text-white rounded-xl ml-2 cursor-pointer">
          Crear
        </button>
      </form>
    </div>
  );
}
