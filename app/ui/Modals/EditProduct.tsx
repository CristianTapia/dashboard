"use client";

import React, { useImperativeHandle, useState, forwardRef, useRef, use } from "react";
import { useRouter } from "next/navigation";
import ImageInput from "../Modals/ImageInput";
import { Product, Category } from "@/app/lib/types";
import { is } from "zod/locales";

const EditProduct = forwardRef(function EditProduct(
  { onSuccess, product, categories }: { onSuccess: () => void; product: Product; categories: Category[] },
  ref: React.Ref<HTMLFormElement>
) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    category_id: "",
  });

  const router = useRouter();
  const localRef = useRef<HTMLFormElement>(null);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(false);

  const [imagePath, setImagePath] = useState<string | null>(null);

  // Edition mode
  const [isActive, setIsActive] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [draftValue, setDraftValue] = useState<string>("");
  const [isSaving, setIssaving] = useState(false);

  // Normalize function to handle case and whitespace
  const normalize = (s: string) => s.trim().toLowerCase();

  // [POST] NUEVA CATEGORÍA USANDO INPUT
  // Cierra el input y limpia
  const handleEditCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;

    // Evita duplicados en cliente
    // if (initialCategories.some((c) => normalize(c.name) === normalize(name))) {
    //   alert("Esa categoría ya existe.");
    //   return;
    // }

    try {
      setEditingCategory(true);
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const created = await res.json();

      if (!res.ok) {
        console.error("Error al crear categoría:", created);
        alert(created?.error ?? "No se pudo crear la categoría");
        return;
      }

      // Añade a la lista y selecciónala
      setForm((prev) => ({ ...prev, category_id: created.id }));

      // Limpia UI
      setNewCategory("");
      // setIsActive(false);
    } catch (e: any) {
      alert("Error de red: " + e.message);
    } finally {
      setEditingCategory(false);
    }
    // Vuelve a renderizar el parent server component y re-fetch
    router.refresh();
  };

  // POST DE PRODUCTOS A TRAVÉS DEL FORMULARIO
  // Maneja cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // setForm({ ...form, [e.target.name]: e.target.value });
  };

  useImperativeHandle(ref, () => localRef.current!);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("📤 Enviando:", {
      name: form.name,
      price: Number(form.price),
      stock: Number(form.stock),
      description: form.description,
      category_id: form.category_id,
    });

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          price: Number(form.price),
          stock: form.stock ? Number(form.stock) : 0,
          description: form.description,
          category_id: form.category_id,
          image_path: imagePath,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("🛑 Error del servidor:", result);
        alert("Error: " + (result?.error || "Error desconocido"));
        return;
      }

      console.log("✅ Producto creado:", result);
      setForm({ name: "", price: "", stock: "", description: "", category_id: "" });
      onSuccess();
    } catch (err: any) {
      console.error("🚨 Error de red:", err);
      alert("Error de red: " + err.message);
    }
  };

  return (
    <div>
      {/* Category */}
      <div className="sm:col-span-4 pb-2">
        <label className="text-sm/6 font-medium text-gray-900">Categoría:</label>
        <div className="flex items-center w-full gap-2">
          <div className="flex-[1] text-sm/6 font-medium text-gray-900">{product.category.name}</div>
          {isActive !== "category" && (
            <button
              onClick={() => setIsActive(isActive === "category" ? null : "category")}
              className="cursor-pointer rounded bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700 transition"
            >
              Editar
            </button>
          )}

          {isActive === "category" && (
            <div className="flex gap-4 px-4 py-1.5 items-center text-sm transition">
              <button className="cursor-pointer">✅</button>
              <button onClick={() => setIsActive(null)} className="cursor-pointer">
                ❌
              </button>
              <input type="text" placeholder="Nueva categoría" className="ml-2 border px-2 py-1 rounded" />
            </div>
          )}
        </div>
      </div>

      {/* Name */}
      <div className="sm:col-span-4 pb-2">
        <label className="text-sm/6 font-medium text-gray-900">Nombre:</label>
        <div className="flex items-center w-full gap-2">
          <div className="flex-[1] text-sm/6 font-medium text-gray-900">{product.name}</div>
          {isActive !== "name" && (
            <button
              onClick={() => setIsActive(isActive === "name" ? null : "name")}
              className="cursor-pointer rounded bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700 transition"
            >
              Editar
            </button>
          )}

          {isActive === "name" && (
            <div className="flex gap-4 px-4 py-1.5 items-center text-sm transition">
              <button className="cursor-pointer">✅</button>
              <button onClick={() => setIsActive(null)} className="cursor-pointer">
                ❌
              </button>
              <input type="text" placeholder="Nuevo nombre" className="ml-2 border px-2 py-1 rounded" />
            </div>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="sm:col-span-4 pb-2">
        <label className="text-sm/6 font-medium text-gray-900">Precio:</label>
        <div className="flex items-center w-full gap-2">
          <div className="flex-[1] text-sm/6 font-medium text-gray-900">
            {new Intl.NumberFormat("es-CL", {
              style: "currency",
              currency: "CLP",
              minimumFractionDigits: 0,
            }).format(product.price)}
          </div>
          {isActive !== "price" && (
            <button
              onClick={() => setIsActive(isActive === "price" ? null : "price")}
              className="cursor-pointer rounded bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700 transition"
            >
              Editar
            </button>
          )}

          {isActive === "price" && (
            <div className="flex gap-4 px-4 py-1.5 items-center text-sm transition">
              <button className="cursor-pointer">✅</button>
              <button onClick={() => setIsActive(null)} className="cursor-pointer">
                ❌
              </button>
              <input
                name="price"
                type="number"
                className="block grow py-1.5 pr-3 pl-1 text-base text-gray-900 focus:outline-none"
                placeholder="Nuevo precio"
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Stock */}
      <div className="sm:col-span-4 pb-2">
        <label className="text-sm/6 font-medium text-gray-900">Stock:</label>
        <div className="flex items-center w-full gap-2">
          <div className="flex-[1] text-sm/6 font-medium text-gray-900">{product.stock}</div>
          {isActive !== "stock" && (
            <button
              onClick={() => setIsActive(isActive === "stock" ? null : "stock")}
              className="cursor-pointer rounded bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700 transition"
            >
              Editar
            </button>
          )}

          {isActive === "stock" && (
            <div className="flex gap-4 px-4 py-1.5 items-center text-sm transition">
              <button className="cursor-pointer">✅</button>
              <button onClick={() => setIsActive(null)} className="cursor-pointer">
                ❌
              </button>
              <input
                name="stock"
                type="number"
                className="block grow py-1.5 pr-3 pl-1 text-base text-gray-900 focus:outline-none"
                placeholder="Nuevo stock"
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="sm:col-span-4 pb-2">
        <label className="text-sm/6 font-medium text-gray-900">Descripción:</label>
        <div className="flex items-center w-full gap-2">
          <div className="flex-[1] text-sm/6 font-medium text-gray-900">{product.description}</div>
          {isActive !== "description" && (
            <button
              onClick={() => setIsActive(isActive === "description" ? null : "description")}
              className="cursor-pointer rounded bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700 transition"
            >
              Editar
            </button>
          )}

          {isActive === "description" && (
            <div className="flex gap-4 px-4 py-1.5 items-center text-sm transition">
              <button className="cursor-pointer">✅</button>
              <button onClick={() => setIsActive(null)} className="cursor-pointer">
                ❌
              </button>
              <input type="text" placeholder="Nueva descripción" className="ml-2 border px-2 py-1 rounded" />
            </div>
          )}
        </div>
      </div>

      {/* Category Add Field */}
      {/* {isActive && (
        <div className="sm:col-span-4 pb-2">
          <div className="flex items-center rounded-md bg-white pl-3 outline-1 outline-gray-300">
            <input
              name="category_name"
              type="text"
              value={newCategory}
              placeholder="Nueva categoría"
              className="block grow py-1.5 pr-3 pl-1 text-base text-gray-900 focus:outline-none"
              onChange={(e) => setNewCategory(e.target.value)}
              required
            /> */}
      {/* Save button */}
      {/* <button
              type="button"
              onClick={handleEditCategory}
              disabled={!newCategory.trim() || editingCategory}
              className="cursor-pointer rounded bg-emerald-600 px-4 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {editingCategory ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )} */}

      <form ref={localRef} onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Imagen */}
        <ImageInput onUploaded={setImagePath} />
      </form>
    </div>
  );
});

export default EditProduct;
