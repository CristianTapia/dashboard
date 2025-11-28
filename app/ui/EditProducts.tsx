"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/app/ui/ImageUpload";
import { updateProductAction } from "@/app/dashboard/productos/actions";
import Image from "next/image";
import type { Category } from "@/app/lib/validators/types";

export default function EditProducts({
  productId,
  productName,
  productPrice,
  productStock,
  productDescription,
  productImageUrl,
  productImagePath,
  productCategoryId,
  categories,
  onCancel,
  onSuccess,
}: {
  productId: number;
  productName: string;
  productPrice: number;
  productStock: number;
  productDescription: string;
  productImageUrl: string | null;
  productImagePath: string | null;
  productCategoryId: number | null;
  categories: Category[];
  onCancel?: () => void;
  onSuccess?: () => void;
}) {
  const [name, setName] = useState(productName);
  const [price, setPrice] = useState(productPrice.toString());
  const [stock, setStock] = useState(productStock.toString());
  const [description, setDescription] = useState(productDescription ?? "");
  const [imagePath, setImagePath] = useState<string | null>(productImagePath ?? null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(productImageUrl ?? null);
  const [categoryId, setCategoryId] = useState<string>(productCategoryId?.toString() ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploaderKey, setUploaderKey] = useState(0);
  const [pending, startTransition] = useTransition();
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    setName(productName);
    setPrice(productPrice.toString());
    setStock(productStock.toString());
    setDescription(productDescription ?? "");
  }, [productName, productPrice, productStock, productDescription]);

  useEffect(() => {
    setImagePath(productImagePath ?? null);
  }, [productImagePath]);

  useEffect(() => {
    setPreviewUrl(productImageUrl ?? null);
  }, [productImageUrl]);

  useEffect(() => {
    setCategoryId(productCategoryId?.toString() ?? "");
  }, [productCategoryId]);

  const updatePreviewFromPath = async (path: string | null) => {
    if (!path) {
      setPreviewUrl(null);
      return;
    }
    if (/^https?:\/\//i.test(path)) {
      setPreviewUrl(path);
      return;
    }
    try {
      const res = await fetch(`/api/signed?path=${encodeURIComponent(path)}`);
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      setPreviewUrl(url);
    } catch (err) {
      console.error(err);
      setPreviewUrl(null);
    }
  };

  const handleImageChange = (info: any) => {
    const val = typeof info === "string" ? info : info?.path ?? info?.url ?? null;
    setImagePath(val);
    updatePreviewFromPath(val);
  };

  const triggerImageUpload = () => {
    if (uploading) return;
    uploadInputRef.current?.click();
  };

  const clearImage = () => {
    setImagePath(null);
    setPreviewUrl(null);
    if (uploadInputRef.current) {
      uploadInputRef.current.value = "";
    }
  };

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextName = name.trim() || productName;
    const nextPrice = Number(price) || productPrice;
    const nextStock = Number(stock) || productStock;
    const finalDescription = description.trim() || productDescription;
    if (!categoryId) {
      alert("Selecciona una categoría");
      return;
    }
    const nextCategoryId = Number(categoryId);
    if (!Number.isFinite(nextCategoryId)) {
      alert("Categoría inválida");
      return;
    }
    if (uploading) return alert("Espera a que termine la subida de la imagen");

    startTransition(async () => {
      try {
        const payload: {
          name?: string;
          price?: number;
          stock?: number;
          description?: string;
          image_path?: string | null;
          category_id?: number;
        } = {};
        if (nextName !== productName) {
          payload.name = nextName;
        }
        if (nextPrice !== productPrice) {
          payload.price = nextPrice;
        }
        if (nextStock !== productStock) {
          payload.stock = nextStock;
        }
        if (finalDescription !== productDescription) {
          payload.description = finalDescription;
        }
        if (imagePath !== productImagePath) {
          payload.image_path = imagePath;
        }
        if (nextCategoryId !== productCategoryId) {
          payload.category_id = nextCategoryId;
        }
        if (Object.keys(payload).length === 0) {
          alert("No hay cambios para guardar");
          return;
        }

        const res = await updateProductAction(productId, payload);
        if (res?.ok) {
          alert("Producto editado");
          setName(nextName);
          setPrice(nextPrice.toString());
          setStock(nextStock.toString());
          setDescription(finalDescription);
          setImagePath(imagePath ?? null);
          setCategoryId(nextCategoryId.toString());
          updatePreviewFromPath(imagePath ?? null);
          setUploaderKey((k) => k + 1);
          router.refresh();
          onSuccess?.();
        }
      } catch (err: any) {
        alert(err?.message || "Error agregando el producto");
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
              <p className="dark:text-gray-200 text-sm font-bold leading-normal font-display">Imagen Actual</p>
              <div className="flex items-center gap-4">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt={productId.toString()}
                    width={400}
                    height={400}
                    className="relative h-24 w-24 flex-shrink-0 rounded-xl border object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-24 h-24 border border-gray-300 rounded-xl flex items-center justify-center text-sm">
                    Sin imagen
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={triggerImageUpload}
                    disabled={pending || uploading}
                    className="flex h-9 cursor-pointer items-center justify-center overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700 px-3 text-sm font-semibold text-gray-800 dark:text-gray-200 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {uploading ? "Reemplazando..." : "Reemplazar"}
                  </button>
                  <button
                    type="button"
                    onClick={clearImage}
                    disabled={pending || uploading}
                    className="flex h-9 cursor-pointer items-center justify-center overflow-hidden rounded-md px-3 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <label className="text-sm pb-2 font-semibold">Categoría</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={pending || uploading}
            className="form-select text-sm bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 mb-4"
          >
            <option value="" disabled>
              Selecciona una categoría
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <label className="text-sm pb-2 font-semibold">Nuevo Nombre</label>
          <input
            // name={productName}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input text-sm bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 mb-4"
            placeholder="Introduce el nombre del producto"
            disabled={pending || uploading}
          />
          <label className="text-sm pb-2 font-semibold">Nuevo Precio</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onKeyDown={(e) => {
              if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
            }}
            className="form-input text-sm bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 mb-4"
            placeholder="Introduce el precio del producto"
            disabled={pending || uploading}
          />
          <label className="text-sm pb-2 font-semibold">Nuevo Stock</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            onKeyDown={(e) => {
              if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
            }}
            className="form-input text-sm bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 mb-4"
            placeholder="Introduce el precio del producto"
            disabled={pending || uploading}
          />
          <label className="text-sm pb-2 font-semibold">Nueva Descripción</label>
          <textarea
            name={productDescription}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-textarea text-sm bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 h-24"
            placeholder="Introduce la descripción del producto"
            disabled={pending || uploading}
          />
        </div>

        <div className="hidden">
          {/* Sube a images/products/... */}
          <ImageUpload
            key={uploaderKey}
            folder="products"
            onUploaded={handleImageChange}
            onUploadingChange={setUploading}
            inputRef={uploadInputRef}
          />
        </div>

        {/* Botón para enviar el formulario */}
        <div className="flex justify-end text-sm font-bold">
          <button
            type="submit"
            disabled={pending || uploading}
            className="flex px-4 p-3 gap-2 rounded-xl cursor-pointer bg-[var(--color-button-send)] text-white
                       disabled:opacity-60 items-center justify-center transition hover:bg-[var(--color-button-send-hover)]"
          >
            {pending ? "Creando..." : uploading ? "Guardar Cambios" : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
