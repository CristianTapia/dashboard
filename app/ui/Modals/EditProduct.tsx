"use client";

import React, { useImperativeHandle, useState, forwardRef, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import ImageInput from "../Modals/ImageInput";
import { Product, Category } from "@/app/lib/types";

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
  const [imagePath, setImagePath] = useState<string | null>(null);

  // Edition mode
  const [isActive, setIsActive] = useState<string | null>(null);

  // Normalize function to handle case and whitespace
  const normalize = (s: string) => s.trim().toLowerCase();

  // POST DE PRODUCTOS A TRAVÉS DEL FORMULARIO
  // Maneja cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          price: Number(form.price),
          stock: form.stock ? Number(form.stock) : 0,
          description: form.description || null,
          category_id: form.category_id ? Number(form.category_id) : null,
          // image_path: imagePath,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("🛑 Error del servidor:", result);
        alert("Error: " + (result?.error || "Error desconocido"));
        return;
      }

      console.log("✅ Producto editado:", result);
      setForm({ name: "", price: "", stock: "", description: "", category_id: "" });
      setIsActive(null);
      onSuccess();
      router.refresh();
    } catch (err: any) {
      console.error("🚨 Error de red:", err);
      alert("Error de red: " + err.message);
    }
  };

  // Initialize form with product data
  useEffect(() => {
    if (!product) return;
    setForm({
      name: product.name ?? "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      description: product.description ?? "",
      category_id: String(""),
    });
  }, [product]);

  const selectedCategoryName = categories.find((c) => String(c.id) === form.category_id)?.name ?? product.category.name;

  return (
    <div>
      {/* Category */}
      <div className="sm:col-span-4 pb-2">
        <label className="text-sm/6 font-medium text-gray-900">Categoría:</label>
        <div className="flex items-center w-full gap-2">
          {/* <div className="flex-[1] text-sm/6 font-medium text-gray-900">{product.category.name}</div> */}
          <div className="flex-[1] text-sm/6 font-medium text-gray-900">{selectedCategoryName}</div>
          {isActive !== "category" && (
            <button
              type="button"
              onClick={() => setIsActive(isActive === "category" ? null : "category")}
              className="cursor-pointer rounded bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700 transition"
            >
              Editar
            </button>
          )}

          {isActive === "category" && (
            <div className="flex gap-4 px-4 py-1.5 items-center text-sm transition">
              <button type="button" className="cursor-pointer">
                ✅
              </button>
              <button type="button" onClick={() => setIsActive(null)} className="cursor-pointer">
                ❌
              </button>
              <select
                className="cursor-pointer text-sm/6 font-medium text-gray-900 outline-1 rounded-md outline-gray-300 py-1.5"
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <form ref={localRef} onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div className="sm:col-span-4 pb-2">
          <label className="text-sm/6 font-medium text-gray-900">Nombre:</label>
          <div className="flex items-center w-full gap-2">
            <div className="flex-[1] text-sm/6 font-medium text-gray-900">{product.name}</div>
            {isActive !== "name" && (
              <button
                type="button"
                onClick={() => setIsActive(isActive === "name" ? null : "name")}
                className="cursor-pointer rounded bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700 transition"
              >
                Editar
              </button>
            )}

            {isActive === "name" && (
              <div className="flex gap-4 px-4 py-1.5 items-center text-sm transition">
                <button type="button" className="cursor-pointer">
                  ✅
                </button>
                <button type="button" onClick={() => setIsActive(null)} className="cursor-pointer">
                  ❌
                </button>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nuevo nombre"
                  className="text-sm/6 font-medium text-gray-900 outline-1 rounded-md outline-gray-300 py-1.5"
                />
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
                type="button"
                onClick={() => setIsActive(isActive === "price" ? null : "price")}
                className="cursor-pointer rounded bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700 transition"
              >
                Editar
              </button>
            )}

            {isActive === "price" && (
              <div className="flex gap-4 px-4 py-1.5 items-center text-sm transition">
                <button type="button" className="cursor-pointer">
                  ✅
                </button>
                <button type="button" onClick={() => setIsActive(null)} className="cursor-pointer">
                  ❌
                </button>
                <input
                  name="price"
                  type="number"
                  value={form.price}
                  className="text-sm/6 font-medium text-gray-900 outline-1 rounded-md outline-gray-300 py-1.5"
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
                type="button"
                onClick={() => setIsActive(isActive === "stock" ? null : "stock")}
                className="cursor-pointer rounded bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700 transition"
              >
                Editar
              </button>
            )}

            {isActive === "stock" && (
              <div className="flex gap-4 px-4 py-1.5 items-center text-sm transition">
                <button type="button" className="cursor-pointer">
                  ✅
                </button>
                <button type="button" onClick={() => setIsActive(null)} className="cursor-pointer">
                  ❌
                </button>
                <input
                  name="stock"
                  type="number"
                  value={form.stock}
                  className="text-sm/6 font-medium text-gray-900 outline-1 rounded-md outline-gray-300 py-1.5"
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
                type="button"
                onClick={() => setIsActive(isActive === "description" ? null : "description")}
                className="cursor-pointer rounded bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700 transition"
              >
                Editar
              </button>
            )}

            {isActive === "description" && (
              <div className="flex gap-4 px-4 py-1.5 items-center text-sm transition">
                <button type="button" className="cursor-pointer">
                  ✅
                </button>
                <button type="button" onClick={() => setIsActive(null)} className="cursor-pointer">
                  ❌
                </button>
                <input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Nueva descripción"
                  className="text-sm/6 font-medium text-gray-900 outline-1 rounded-md outline-gray-300 py-1.5"
                />
              </div>
            )}
          </div>
        </div>

        {/* Imagen */}
        {/* <ImageInput onUploaded={setImagePath} /> */}
      </form>
    </div>
  );
});

export default EditProduct;
