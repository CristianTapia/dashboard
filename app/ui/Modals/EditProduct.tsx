"use client";

import React, { useImperativeHandle, useState, forwardRef, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Product, Category } from "@/app/lib/types";

type FieldKey = "category" | "name" | "price" | "stock" | "description" | null;

const EditProduct = forwardRef(function EditProduct(
  { onSuccess, product, categories }: { onSuccess: () => void; product: Product; categories: Category[] },
  ref: React.Ref<HTMLFormElement>
) {
  // Borrador global (lo que se enviará con el PUT)
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    category_id: "",
  });

  // Edición inline
  const [isActive, setIsActive] = useState<FieldKey>(null); // campo activo
  const [fieldDraft, setFieldDraft] = useState<string>(""); // borrador del campo activo

  const router = useRouter();
  const localRef = useRef<HTMLFormElement>(null);
  useImperativeHandle(ref, () => localRef.current!);

  // Inicializa el borrador con los datos del producto
  useEffect(() => {
    if (!product) return;
    setForm({
      name: product.name ?? "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      description: product.description ?? "",
      category_id: product.category?.id ? String(product.category.id) : "", // "" fuerza a elegir en UI
    });
  }, [product]);

  // Helpers de edición por campo
  const startEdit = (field: Exclude<FieldKey, null>) => {
    setIsActive(field);
    switch (field) {
      case "name":
        setFieldDraft(form.name);
        break;
      case "price":
        setFieldDraft(form.price);
        break;
      case "stock":
        setFieldDraft(form.stock);
        break;
      case "description":
        setFieldDraft(form.description);
        break;
      case "category":
        setFieldDraft(form.category_id);
        break;
    }
  };

  const confirmField = () => {
    if (!isActive) return;
    setForm((prev) => {
      const next = { ...prev };
      if (isActive === "category") next.category_id = fieldDraft;
      if (isActive === "name") next.name = fieldDraft;
      if (isActive === "price") next.price = fieldDraft;
      if (isActive === "stock") next.stock = fieldDraft;
      if (isActive === "description") next.description = fieldDraft;
      return next;
    });
    setIsActive(null);
  };

  const cancelField = () => {
    setIsActive(null); // no copiamos nada → no hay cambios
  };

  // Submit global (lo dispara el Modal con requestSubmit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mezcla el campo activo (si quedó abierto) en un draft local
    const draft = { ...form };
    if (isActive) {
      if (isActive === "category") draft.category_id = fieldDraft;
      if (isActive === "name") draft.name = fieldDraft;
      if (isActive === "price") draft.price = fieldDraft;
      if (isActive === "stock") draft.stock = fieldDraft;
      if (isActive === "description") draft.description = fieldDraft;
      alert("Termina de editar este campo (✅ o ❌) antes de confirmar.");
      return;
    }

    // Validaciones mínimas
    if (!draft.name.trim()) return alert("El nombre es obligatorio.");
    if (!draft.category_id) return alert("Debes seleccionar una categoría.");
    const priceNum = Number(draft.price);
    const stockNum = draft.stock ? Number(draft.stock) : 0;
    if (Number.isNaN(priceNum) || priceNum < 0) return alert("Precio inválido.");
    if (Number.isNaN(stockNum) || stockNum < 0) return alert("Stock inválido.");

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          price: priceNum,
          stock: stockNum,
          // Si tu columna es NOT NULL, manda "" en vez de null
          description: typeof draft.description === "string" ? draft.description : "",
          category_id: Number(draft.category_id),
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        console.error("🛑 Error del servidor:", result);
        alert("Error: " + (result?.error || "Error desconocido"));
        return;
      }

      setIsActive(null);
      onSuccess();
      router.refresh();
    } catch (err: any) {
      console.error("🚨 Error de red:", err);
      alert("Error de red: " + err.message);
    }
  };

  // Derivado para mostrar nombre de categoría
  const selectedCategoryName =
    categories.find((c) => String(c.id) === form.category_id)?.name ??
    product.category?.name ??
    "Selecciona una categoría";

  return (
    <div>
      {/* CATEGORÍA */}
      <div className="sm:col-span-4 pb-2">
        <label className="text-sm/6 font-medium text-gray-900">Categoría:</label>
        <div className="relative flex items-center w-full gap-2">
          <div className="flex-1 text-sm/6 font-medium text-gray-900">{selectedCategoryName}</div>

          {isActive !== "category" && (
            <button
              type="button"
              onClick={() => startEdit("category")}
              className="cursor-pointer rounded bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700 transition"
            >
              Editar
            </button>
          )}

          {isActive === "category" && (
            <div className="absolute inset-0 z-10 flex items-center gap-2 bg-white/90 p-1 rounded">
              <select
                value={fieldDraft}
                onChange={(e) => setFieldDraft(e.target.value)}
                className="cursor-pointer text-sm/6 font-medium text-gray-900 outline-1 rounded-md outline-gray-300 py-1.5 px-2"
                onKeyDown={(e) => e.key === "Enter" && confirmField()}
              >
                <option value="" disabled>
                  Selecciona una categoría
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <button type="button" onClick={confirmField} className="px-2">
                ✅
              </button>
              <button type="button" onClick={cancelField} className="px-2">
                ❌
              </button>
            </div>
          )}
        </div>
      </div>

      <form ref={localRef} onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* NOMBRE */}
        <div className="sm:col-span-4 pb-2">
          <label className="text-sm/6 font-medium text-gray-900">Nombre:</label>
          <div className="relative flex items-center w-full gap-2">
            <div className="flex-1 text-sm/6 font-medium text-gray-900">{form.name}</div>

            {isActive !== "name" && (
              <button
                type="button"
                onClick={() => startEdit("name")}
                className="cursor-pointer rounded bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700 transition"
              >
                Editar
              </button>
            )}

            {isActive === "name" && (
              <div className="absolute inset-0 z-10 flex items-center gap-2 bg-white/90 p-1 rounded">
                <input
                  type="text"
                  value={fieldDraft}
                  onChange={(e) => setFieldDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && confirmField()}
                  className="flex-1 text-sm/6 font-medium text-gray-900 outline-1 rounded-md outline-gray-300 py-1.5 px-2"
                  autoFocus
                />
                <button type="button" onClick={confirmField} className="px-2">
                  ✅
                </button>
                <button type="button" onClick={cancelField} className="px-2">
                  ❌
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PRECIO */}
        <div className="sm:col-span-4 pb-2">
          <label className="text-sm/6 font-medium text-gray-900">Precio:</label>
          <div className="relative flex items-center w-full gap-2">
            <div className="flex-1 text-sm/6 font-medium text-gray-900">
              {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(
                Number(form.price || 0)
              )}
            </div>

            {isActive !== "price" && (
              <button
                type="button"
                onClick={() => startEdit("price")}
                className="cursor-pointer rounded bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700 transition"
              >
                Editar
              </button>
            )}

            {isActive === "price" && (
              <div className="absolute inset-0 z-10 flex items-center gap-2 bg-white/90 p-1 rounded">
                <input
                  type="number"
                  value={fieldDraft}
                  onChange={(e) => setFieldDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                    if (e.key === "Enter") confirmField();
                  }}
                  className="flex-1 text-sm/6 font-medium text-gray-900 outline-1 rounded-md outline-gray-300 py-1.5 px-2"
                  autoFocus
                />
                <button type="button" onClick={confirmField} className="px-2">
                  ✅
                </button>
                <button type="button" onClick={cancelField} className="px-2">
                  ❌
                </button>
              </div>
            )}
          </div>
        </div>

        {/* STOCK */}
        <div className="sm:col-span-4 pb-2">
          <label className="text-sm/6 font-medium text-gray-900">Stock:</label>
          <div className="relative flex items-center w-full gap-2">
            <div className="flex-1 text-sm/6 font-medium text-gray-900">{form.stock}</div>

            {isActive !== "stock" && (
              <button
                type="button"
                onClick={() => startEdit("stock")}
                className="cursor-pointer rounded bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700 transition"
              >
                Editar
              </button>
            )}

            {isActive === "stock" && (
              <div className="absolute inset-0 z-10 flex items-center gap-2 bg-white/90 p-1 rounded">
                <input
                  type="number"
                  value={fieldDraft}
                  onChange={(e) => setFieldDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                    if (e.key === "Enter") confirmField();
                  }}
                  className="flex-1 text-sm/6 font-medium text-gray-900 outline-1 rounded-md outline-gray-300 py-1.5 px-2"
                  autoFocus
                />
                <button type="button" onClick={confirmField} className="px-2">
                  ✅
                </button>
                <button type="button" onClick={cancelField} className="px-2">
                  ❌
                </button>
              </div>
            )}
          </div>
        </div>

        {/* DESCRIPCIÓN */}
        <div className="sm:col-span-4 pb-2">
          <label className="text-sm/6 font-medium text-gray-900">Descripción:</label>
          <div className="relative flex items-center w-full gap-2">
            <div className="flex-1 text-sm/6 font-medium text-gray-900">{form.description || "—"}</div>

            {isActive !== "description" && (
              <button
                type="button"
                onClick={() => startEdit("description")}
                className="cursor-pointer rounded bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700 transition"
              >
                Editar
              </button>
            )}

            {isActive === "description" && (
              <div className="absolute inset-0 z-10 flex items-center gap-2 bg-white/90 p-1 rounded">
                <input
                  type="text"
                  value={fieldDraft}
                  onChange={(e) => setFieldDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && confirmField()}
                  className="flex-1 text-sm/6 font-medium text-gray-900 outline-1 rounded-md outline-gray-300 py-1.5 px-2"
                  autoFocus
                />
                <button type="button" onClick={confirmField} className="px-2">
                  ✅
                </button>
                <button type="button" onClick={cancelField} className="px-2">
                  ❌
                </button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
});

export default EditProduct;
