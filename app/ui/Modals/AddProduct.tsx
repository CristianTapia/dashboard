"use client";

import { FormEvent, forwardRef, useImperativeHandle, useRef, useState } from "react";
import ImageInput from "./ImageInput";

interface Props {
  onSubmitAction: (data: any) => void;
}

// 👇 forwardRef debe envolver la función del componente
const AddProduct = forwardRef<HTMLFormElement, Props>(({ onSubmitAction }, ref) => {
  const localRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    categoryName: "",
  });

  // Exponer el form al componente padre usando el ref
  useImperativeHandle(ref, () => localRef.current!);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmitAction({
      name: formData.name,
      price: Number(formData.price),
      stock: formData.stock ? Number(formData.stock) : undefined,
      categoryName: formData.categoryName,
    });
  }

  return (
    <form ref={localRef} onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Nombre */}
      <div className="sm:col-span-4 pb-4">
        <label className="text-sm/6 font-medium text-gray-900">Nombre *</label>
        <div className="flex items-center rounded-md bg-white pl-3 outline-1 outline-gray-300">
          <input
            name="name"
            type="text"
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

      {/* Categoría */}
      <div className="sm:col-span-4 pb-4">
        <label className="text-sm/6 font-medium text-gray-900">Categoría *</label>
        <div className="flex items-center rounded-md bg-white pl-3 outline-1 outline-gray-300">
          <input
            name="categoryName"
            type="text"
            className="block grow py-1.5 pr-3 pl-1 text-base text-gray-900 focus:outline-none"
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Imagen */}
      <ImageInput />

      {/* Stock */}
      <div className="sm:col-span-4">
        <label className="text-sm/6 font-medium text-gray-900">Stock</label>
        <div className="flex items-center rounded-md bg-white pl-3 outline-1 outline-gray-300">
          <input
            name="stock"
            type="number"
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
    </form>
  );
});

// 👇 exportar correctamente el componente envuelto
export default AddProduct;
