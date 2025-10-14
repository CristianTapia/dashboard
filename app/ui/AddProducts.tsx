"use client";

import { useState, useTransition } from "react";
import ImageUpload from "@/app/ui/ImageUpload";
import { Upload } from "lucide-react";
import { createProductAction } from "@/app/dashboard/productos/actions";
import { Category } from "@/app/lib/validators/types";

export default function AddProducts({ categories }: { categories: Category[] }) {
  // Form states
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [imagePath, setImagePath] = useState<string | null>(null);

  // State management for uploading and saving
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

    if (!name.trim()) return alert("El nombre es obligatorio");
    if (price === "" || Number(price) <= 0) return alert("Precio inválido");
    if (categoryId === "" || Number.isNaN(Number(categoryId))) return alert("Selecciona una categoría");
    if (!description.trim()) return alert("La descripción es obligatoria");
    if (uploading) return alert("Espera a que termine la subida de la imagen 🙏");

    startTransition(async () => {
      try {
        const res = await createProductAction({
          name: name.trim(),
          price: Number(price),
          stock: stock === "" ? 0 : Number(stock),
          category_id: Number(categoryId),
          description: description.trim(),
          image_path: imagePath ?? null,
        });
        if (res?.ok) {
          alert("Producto creado ✅");
          setName("");
          setPrice("");
          setStock("");
          setCategoryId("");
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
        <h1 className="text-3xl font-bold">Agregar Productos</h1>
        <p className="text-md text-[var(--color-txt-secondary)]">
          Agrega nuevos productos. Se visualizarán inmediatamente en el menú.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-6 mt-6">
        <div className="flex flex-col">
          {/* Nombre */}
          <label className="text-sm pb-2 font-semibold">Nombre *</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Fideos con salsa"
            disabled={saving || uploading}
            className="bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)]
               focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)]
               p-3"
            required
          />
        </div>

        <div></div>
        {/* Precio */}
        <div className="flex flex-col">
          <label className="text-sm pb-2 font-semibold">Precio *</label>
          <input
            type="number"
            name="price"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            placeholder="Ej: 5000"
            disabled={saving || uploading}
            className="bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)]
               focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)]
               p-3"
            onKeyDown={(e) => {
              if (["e", "E", "+", "-"].includes(e.key)) {
                e.preventDefault();
              }
            }}
            required
          />
        </div>
        {/* Categoría */}
        <div className="flex flex-col">
          <label className="text-sm pb-2 font-semibold">Categoría *</label>
          <select
            name="category_id"
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            disabled={saving || uploading}
            // className="bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)]
            //    focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)]
            //    p-3"
            className={`bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)]
              focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3
              ${categoryId === "" ? "text-[var(--color-txt-placeholder)]" : "text-black"}`}
            required
          >
            <option value="" disabled hidden>
              Selecciona una categoría
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        {/* Stock */}
        <div className="flex flex-col">
          <label className="text-sm pb-2 font-semibold">Stock</label>
          <input
            type="number"
            name="stock"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            placeholder="Ej: 20"
            disabled={saving || uploading}
            className="bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)]
               focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)]
               p-3"
            onKeyDown={(e) => {
              if (["e", "E", "+", "-"].includes(e.key)) {
                e.preventDefault();
              }
            }}
            required
          />
        </div>
        {/* Descripción */}
        <div className="flex flex-col">
          <label className="text-sm pb-2 font-semibold">Descripción *</label>
          <textarea
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-textarea bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 h-24"
            placeholder="Ej: Fideos con salsa de tomate casera"
            disabled={saving || uploading}
          />
        </div>

        {/* Sube a images/products/... */}
        <ImageUpload
          key={uploaderKey}
          folder="products"
          onUploaded={handleImageChange}
          onUploadingChange={setUploading}
        />

        {/* Boton para enviar el formulario */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || uploading}
            className="p-3 bg-[var(--color-button-send)] text-white rounded-xl ml-2 cursor-pointer disabled:opacity-60 inline-flex items-center justify-center gap-2 transition"
          >
            <Upload />
            {saving ? "Creando..." : uploading ? "Subiendo imagen..." : "Agregar"}
          </button>
        </div>
      </form>
    </div>
  );
}
