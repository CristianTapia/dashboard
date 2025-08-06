// "use client";

// import { FormEvent, forwardRef, useImperativeHandle, useRef, useState } from "react";
// import ImageInput from "./ImageInput";

// interface Props {
//   onSubmitAction: (data: any) => void;
// }

// // 👇 forwardRef debe envolver la función del componente
// const AddProduct = forwardRef<HTMLFormElement, Props>(({ onSubmitAction }, ref) => {
//   const localRef = useRef<HTMLFormElement>(null);

//   const [formData, setFormData] = useState({
//     name: "",
//     price: "",
//     stock: "",
//     categoryName: "",
//   });

//   // Exponer el form al componente padre usando el ref
//   useImperativeHandle(ref, () => localRef.current!);

//   function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   }

//   function handleSubmit(e: FormEvent) {
//     e.preventDefault();
//     onSubmitAction({
//       name: formData.name,
//       price: Number(formData.price),
//       stock: formData.stock ? Number(formData.stock) : undefined,
//       categoryName: formData.categoryName,
//     });
//   }

//   return (
//     <form ref={localRef} onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//       {/* Nombre */}
//       <div className="sm:col-span-4 pb-4">
//         <label className="text-sm/6 font-medium text-gray-900">Nombre *</label>
//         <div className="flex items-center rounded-md bg-white pl-3 outline-1 outline-gray-300">
//           <input
//             name="name"
//             type="text"
//             className="block grow py-1.5 pr-3 pl-1 text-base text-gray-900 focus:outline-none"
//             onChange={handleChange}
//             required
//           />
//         </div>
//       </div>

//       {/* Precio */}
//       <div className="sm:col-span-4 pb-4">
//         <label className="text-sm/6 font-medium text-gray-900">Precio *</label>
//         <div className="flex items-center rounded-md bg-white pl-3 outline-1 outline-gray-300">
//           <input
//             name="price"
//             type="number"
//             className="block grow py-1.5 pr-3 pl-1 text-base text-gray-900 focus:outline-none"
//             onChange={handleChange}
//             required
//             onKeyDown={(e) => {
//               if (["e", "E", "+", "-"].includes(e.key)) {
//                 e.preventDefault();
//               }
//             }}
//           />
//         </div>
//       </div>

//       {/* Categoría */}
//       <div className="sm:col-span-4 pb-4">
//         <label className="text-sm/6 font-medium text-gray-900">Categoría *</label>
//         <div className="flex items-center rounded-md bg-white pl-3 outline-1 outline-gray-300">
//           <input
//             name="categoryName"
//             type="text"
//             className="block grow py-1.5 pr-3 pl-1 text-base text-gray-900 focus:outline-none"
//             onChange={handleChange}
//             required
//           />
//         </div>
//       </div>

//       {/* Imagen */}
//       <ImageInput />

//       {/* Stock */}
//       <div className="sm:col-span-4">
//         <label className="text-sm/6 font-medium text-gray-900">Stock</label>
//         <div className="flex items-center rounded-md bg-white pl-3 outline-1 outline-gray-300">
//           <input
//             name="stock"
//             type="number"
//             className="block grow py-1.5 pr-3 pl-1 text-base text-gray-900 focus:outline-none"
//             placeholder="Opcional"
//             onChange={handleChange}
//             onKeyDown={(e) => {
//               if (["e", "E", "+", "-"].includes(e.key)) {
//                 e.preventDefault();
//               }
//             }}
//           />
//         </div>
//       </div>
//     </form>
//   );
// });

// // 👇 exportar correctamente el componente envuelto
// export default AddProduct;

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
  // const [name, setName] = useState("");
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
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
      setForm({ name: "", price: "", stock: "", category_id: "" });
      onSuccess();
    } catch (err: any) {
      console.error("🚨 Error de red:", err);
      alert("Error de red: " + err.message);
    }
  };

  return (
    <form ref={localRef} onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Nombre */}
      {/* <div className="sm:col-span-4 pb-4">
        <label className="text-sm/6 font-medium text-gray-900">Nombre *</label>
        <div className="flex items-center rounded-md bg-white pl-3 outline-1 outline-gray-300">
          <input
            name="name"
            type="text"
            className="block grow py-1.5 pr-3 pl-1 text-base text-gray-900 focus:outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      </div> */}

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

      {/* Categoría */}
      {/* <div className="sm:col-span-4 pb-4">
        <label className="text-sm/6 font-medium text-gray-900">Categoría *</label>
        <div className="flex items-center rounded-md bg-white pl-3 outline-1 outline-gray-300">
          <input
            name="categoryName"
            type="text"
            value={form.category_id}
            className="block grow py-1.5 pr-3 pl-1 text-base text-gray-900 focus:outline-none"
            onChange={handleChange}
            required
          />
        </div>
      </div> */}

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
    </form>
  );
});

export default AddProduct;
