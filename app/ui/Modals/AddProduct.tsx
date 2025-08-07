"use client";

import React, { useImperativeHandle, useState, forwardRef, useEffect, useRef } from "react";

type Category = {
  id: string;
  name: string;
};

const AddProduct = forwardRef(function AddProduct(
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

  const [categories, setCategories] = useState<Category[]>([]);
  const localRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
    <form ref={localRef} onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Category */}
      <select
        className="text-sm/6 font-medium text-gray-900"
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

      {/* Nombre */}
      <div className="sm:col-span-4 pb-4">
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
      {/* <ImageInput /> */}

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
            value={form.description}
            className="block grow py-1.5 pr-3 pl-1 text-base text-gray-900 focus:outline-none"
            onChange={handleChange}
          />
        </div>
      </div>
    </form>
  );
});

export default AddProduct;
//
