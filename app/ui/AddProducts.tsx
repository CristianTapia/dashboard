"use client";

import { useState, useTransition } from "react";
import ImageUpload from "@/app/ui/ImageUpload";
import { createProductAction } from "@/app/dashboard/productos/actions";
import { Category, TenantOption } from "@/app/lib/validators/types";

export default function AddProducts({
  onCancel,
  onSuccess,
  categories,
  tenants,
  isAdmin,
  activeTenantId,
}: {
  onCancel?: () => void;
  onSuccess?: () => void;
  categories: Category[];
  tenants: TenantOption[];
  isAdmin: boolean;
  activeTenantId: string;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [tenantId, setTenantId] = useState<string>(activeTenantId);
  const [categoryId, setCategoryId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [imagePath, setImagePath] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploaderKey, setUploaderKey] = useState(0);
  const [pending, startTransition] = useTransition();
  const saving = pending;

  const visibleCategories = isAdmin
    ? categories.filter((c) => (c.tenant_id ?? c.tenant?.id ?? "") === tenantId)
    : categories;

  const handleImageChange = (info: unknown) => {
    const obj = info as { path?: string; url?: string } | string | null;
    const val = typeof obj === "string" ? obj : obj?.path ?? obj?.url ?? null;
    setImagePath(val);
  };

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) return alert("El nombre es obligatorio");
    if (price === "" || Number(price) <= 0) return alert("Precio invalido");
    if (isAdmin && !tenantId) return alert("Selecciona un tenant");
    if (categoryId === "") return alert("Selecciona una categoria");
    if (!description.trim()) return alert("La descripcion es obligatoria");
    if (uploading) return alert("Espera a que termine la subida de la imagen");

    startTransition(async () => {
      try {
        const res = await createProductAction({
          name: name.trim(),
          price: Number(price),
          stock: stock === "" ? 0 : Number(stock),
          category_id: Number(categoryId),
          description: description.trim(),
          image_path: imagePath ?? null,
          tenant_id: isAdmin ? tenantId : undefined,
        });

        if (res?.ok) {
          alert("Producto creado");
          setName("");
          setPrice("");
          setStock("");
          setTenantId(activeTenantId);
          setCategoryId("");
          setDescription("");
          setImagePath(null);
          setUploaderKey((k) => k + 1);
          onSuccess?.();
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error agregando el producto";
        alert(message);
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl flex flex-col text-sm">
      <form onSubmit={onSubmit} className="flex flex-col gap-6 mt-6">
        {isAdmin && (
          <div className="flex flex-col">
            <label className="text-sm pb-2 font-semibold">Tenant *</label>
            <select
              value={tenantId}
              onChange={(e) => {
                setTenantId(e.target.value);
                setCategoryId("");
              }}
              disabled={saving || uploading}
              className="cursor-pointer w-full bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)]
                         focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3"
              required
            >
              <option value="" disabled>
                Selecciona un tenant
              </option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col">
          <label className="text-sm pb-2 font-semibold">Nombre *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Fideos con salsa"
            disabled={saving || uploading}
            className="bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)]
                       focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3"
            required
          />
        </div>

        <div className="flex flex-row flex-wrap gap-6">
          <div className="flex flex-col flex-1 basis-0 min-w-[300px]">
            <label className="pb-2 font-semibold">Precio *</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Ej: 5000"
              disabled={saving || uploading}
              className="w-full bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)]
                         focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3"
              onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
              required
            />
          </div>

          <div className="flex flex-col flex-1 basis-0 min-w-[300px]">
            <label className="text-sm pb-2 font-semibold">Stock</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Ej: 20"
              disabled={saving || uploading}
              className="w-full bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)]
                         focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3"
              onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-sm pb-2 font-semibold">Categoria *</label>
          <div className="relative">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={saving || uploading}
              className={`cursor-pointer w-full appearance-none
                bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)]
                focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)]
                p-3 ${categoryId === "" ? "text-gray-500" : "text-black"}`}
              required
            >
              <option value="" disabled hidden>
                Selecciona una categoria
              </option>
              {visibleCategories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-70"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-sm pb-2 font-semibold">Descripcion *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-textarea bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)]
                       focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 h-24"
            placeholder="Ej: Fideos con salsa de tomate casera"
            disabled={saving || uploading}
          />
        </div>

        <ImageUpload key={uploaderKey} folder="products" onUploaded={handleImageChange} onUploadingChange={setUploading} />

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
            {saving ? "Creando..." : uploading ? "Subiendo imagen..." : "Anadir"}
          </button>
        </div>
      </form>
    </div>
  );
}
