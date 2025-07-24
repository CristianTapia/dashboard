"use client";

import { FormEvent, useState } from "react";
import ImageInput from "./ImageInput";

interface Props {
  onSubmitAction: (data: any) => void;
}

export default function AddProduct({ onSubmitAction }: Props) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    categoryName: "",
  });

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
    <form id="add-product-form" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Name */}
      <div className="sm:col-span-4 pb-4">
        <label className="text-sm/6 font-medium text-gray-900">Nombre *</label>
        <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
          <input
            name="name"
            type="text"
            className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Price */}
      <div className="sm:col-span-4 pb-4">
        <label className="text-sm/6 font-medium text-gray-900">Precio *</label>
        <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
          <input
            name="price"
            type="number"
            className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
            // placeholder="Opcional"
            onKeyDown={(e) => {
              if (["e", "E", "+", "-"].includes(e.key)) {
                e.preventDefault();
              }
            }}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Category */}
      <div className="sm:col-span-4 pb-4">
        <label className="text-sm/6 font-medium text-gray-900">Categoría *</label>
        <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
          <input
            name="categoryName"
            type="text"
            className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
            // placeholder="Opcional"
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Image */}
      <ImageInput />

      {/* Stock */}
      <div className="sm:col-span-4">
        <label className="text-sm/6 font-medium text-gray-900">Stock</label>
        <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
          <input
            name="stock"
            type="number"
            className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
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
}
