"use client";

import AddCategories from "@/app/ui/AddCategories";
import Modal from "@/app/ui/Modals/Modal";
import { useState } from "react";

export default function CategoriesPage() {
  const [activeModal, setActiveModal] = useState<null | "addCategory">(null);
  // const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId);
  // MODAL
  function openModal(modalName: "addCategory") {
    setActiveModal(modalName);
    //   // setSelectedCategoryId(categoryId ?? null);
  }
  return (
    <>
      <button onClick={() => openModal("addCategory")} className="bg-red-500 border-1 p-2 rounded cursor-pointer">
        Agregar Producto
      </button>
      <Modal
        isOpen={activeModal === "addCategory"}
        onCloseAction={() => setActiveModal(null)}
        title="Añadir categoria"
        body={<AddCategories />}
      />
    </>
  );
}
