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

import React, { useState, forwardRef } from "react";

const AddProduct = forwardRef(function AddProduct(
  { onSuccess }: { onSuccess: () => void },
  ref: React.Ref<HTMLFormElement>
) {
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      onSuccess();
    } else {
      console.error("Error al agregar producto");
    }
  };

  return (
    <form ref={ref} onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Nombre */}
      <div className="sm:col-span-4 pb-4">
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
      </div>
    </form>
  );
});

export default AddProduct;
