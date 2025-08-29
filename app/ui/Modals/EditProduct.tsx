// import ImageInput from "./ImageInput";

// export default function EditProduct() {
//   return (
//     <>
//       <div className="sm:col-span-4 pb-4">
//         <label className="text-sm/6 font-medium text-gray-900">Nombre</label>
//         <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
//           <input
//             type="text"
//             className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
//           />
//         </div>
//       </div>
//       <div className="sm:col-span-4 pb-4">
//         <label className="text-sm/6 font-medium text-gray-900">Precio</label>
//         <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
//           <input
//             type="number"
//             className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
//             // placeholder="Opcional"
//             onKeyDown={(e) => {
//               if (["e", "E", "+", "-"].includes(e.key)) {
//                 e.preventDefault();
//               }
//             }}
//           />
//         </div>
//       </div>
//       <div className="sm:col-span-4 pb-4">
//         <label className="text-sm/6 font-medium text-gray-900">Categoría</label>
//         <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
//           <input
//             type="text"
//             className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
//             // placeholder="Opcional"
//           />
//         </div>
//       </div>

//       <ImageInput />

//       <div className="sm:col-span-4">
//         <label className="text-sm/6 font-medium text-gray-900">Stock</label>
//         <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
//           <input
//             type="number"
//             className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
//             onKeyDown={(e) => {
//               if (["e", "E", "+", "-"].includes(e.key)) {
//                 e.preventDefault();
//               }
//             }}
//           />
//         </div>
//       </div>
//     </>
//   );
// }

"use client";

import React, { useImperativeHandle, useState, forwardRef, useRef } from "react";
import { useRouter } from "next/navigation";
import ImageInput from "../Modals/ImageInput";

const EditProduct = forwardRef(function AddProduct(
  { onSuccess }: { onSuccess: () => void },
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
  const [isOpen, setIsOpen] = useState(false);
  const [imagePath, setImagePath] = useState<string | null>(null);

  // Normalize function to handle case and whitespace
  const normalize = (s: string) => s.trim().toLowerCase();

  // POST NUEVA CATEGORÍA USANDO INPUT
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
      setIsOpen(false);
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
      <div className="flex sm:col-span-4 pb-2 gap-2">
        <select
          className="cursor-pointer text-sm/6 font-medium text-gray-900 outline-1 rounded-md outline-gray-300 py-1.5"
          name="category_id"
          value={form.category_id}
          onChange={handleChange}
          required
        >
          <option value="">Selecciona una categoría</option>
          {/* {initialCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))} */}
        </select>

        <button
          onClick={isOpen ? () => setIsOpen(false) : () => setIsOpen(true)}
          className="cursor-pointer rounded bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700 transition"
        >
          {isOpen ? "Cerrar" : "Añadir"}
        </button>
      </div>

      {/* Category Add Field*/}
      {isOpen && (
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
            />
            {/* Save button */}
            <button
              type="button"
              onClick={handleEditCategory}
              disabled={!newCategory.trim() || editingCategory}
              className="cursor-pointer rounded bg-emerald-600 px-4 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {editingCategory ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}

      <form ref={localRef} onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nombre */}
        <div className="sm:col-span-4 pb-2">
          <label className="text-sm/6 font-medium text-gray-900">Nombre *</label>
          <div className="flex items-center rounded-md bg-white pl-3 outline-1 outline-gray-300">
            <input
              name="name"
              type="text"
              value={form.name}
              className="block grow py-1.5 pr-3 pl-1 text-base text-gray-900 focus:outline-none"
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Precio */}
        <div className="sm:col-span-4 pb-4">
          <label className="text-sm/6 font-medium text-gray-900">Precio *</label>
          <div className="flex items-center rounded-md bg-white pl-3 outline-1 outline-gray-300">
            <input
              name="price"
              type="number"
              value={form.price}
              className="block grow py-1.5 pr-3 pl-1 text-base text-gray-900 focus:outline-none"
              onChange={handleChange}
              required
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </div>
        </div>

        {/* Imagen */}
        <ImageInput onUploaded={setImagePath} />

        {/* Stock */}
        <div className="sm:col-span-4">
          <label className="text-sm/6 font-medium text-gray-900">Stock</label>
          <div className="flex items-center rounded-md bg-white pl-3 outline-1 outline-gray-300">
            <input
              name="stock"
              type="number"
              value={form.stock}
              className="block grow py-1.5 pr-3 pl-1 text-base text-gray-900 focus:outline-none"
              placeholder="Opcional"
              onChange={handleChange}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </div>
        </div>

        {/* Description */}
        <div className="sm:col-span-4 pb-4">
          <label className="text-sm/6 font-medium text-gray-900">Descripción</label>
          <div className="flex items-center rounded-md bg-white pl-3 outline-1 outline-gray-300">
            <input
              name="description"
              type="text"
              placeholder="Opcional"
              value={form.description}
              className="block grow py-1.5 pr-3 pl-1 text-base text-gray-900 focus:outline-none"
              onChange={handleChange}
            />
          </div>
        </div>
      </form>
    </div>
  );
});

export default EditProduct;
