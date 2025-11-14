"use client";

import { useState, useTransition } from "react";
import { Edit, Pencil, Trash } from "lucide-react";
import { Highlight } from "../lib/validators/types";
import Image from "next/image";
import Modal from "@/app/ui/Modals/Modal";
import EditHighlights from "./EditHighlights";

export default function AllHighlights({ highlights }: { highlights: Highlight[] }) {
  const [activeModal, setActiveModal] = useState<null | "editHighlight" | "confirmDelete">(null);
  const [selectedHighlightId, setSelectedHighlightId] = useState<number | null>(null);
  const [selectedHighlightDescription, setSelectedHighlightDescription] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openModal(modalName: "editHighlight" | "confirmDelete", highlight: { id: number; description: string }) {
    setSelectedHighlightId(highlight.id);
    setSelectedHighlightDescription(highlight.description);
    setActiveModal(modalName);
  }

  return (
    <div className="p-4 max-w-3xl flex flex-col">
      <div className="flex flex-col items-start gap-2">
        <h1 className="text-3xl font-bold">Todos los Destacados</h1>
        <p className="text-md text-[var(--color-txt-secondary)]">
          Visualiza las ofertas y destacados existentes. Los cambios se reflejarán inmediatamente en el menú.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
        {highlights.map((highlight) => (
          <div
            key={highlight.id}
            className="dark:bg-surface-dark rounded-xl shadow-card overflow-hidden flex flex-col bg-[var(--color-foreground)]"
          >
            <div className="relative">
              {highlight.image_url ? (
                <Image
                  alt={highlight.description || "Highlight Image"}
                  className="w-full h-48 object-cover"
                  src={highlight.image_url ?? ""}
                  width={400}
                  height={300}
                  unoptimized
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">Sin imagen</div>
              )}
            </div>
            <div className="p-4 flex flex-col flex-grow ">
              {/* <h3 className="text-md font-bold text-text-light dark:text-text-dark"></h3> */}
              <p className="mt-1 text-sm text-text-light/70 dark:text-text-dark/70 flex-grow">
                {highlight.description}
              </p>
              <div className="mt-4 pt-4 border-t border-[var(--color-border-box)] dark:border-border-dark flex items-center justify-end gap-2">
                <button
                  onClick={() => openModal("editHighlight", highlight)}
                  className="cursor-pointer p-2 rounded-2xl text-[var(--color-light)] hover:text-[var(--color-light-hover)] hover:bg-[var(--color-cancel)] transition-colors"
                >
                  <Pencil size={18} />
                </button>
                <button className="cursor-pointer p-2 rounded-2xl text-[var(--color-delete)] hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-[var(--color-delete-hover)] transition-colors">
                  <Trash size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de edición de destacado */}
      <Modal
        isOpen={activeModal === "editHighlight"}
        icon={<Pencil color="#137fec" />}
        iconBgOptionalClassName="bg-[var(--color-bg-selected)]"
        onCloseAction={() => setActiveModal(null)}
        title={"Editar Destacado"}
        fixedBody={
          <EditHighlights highlightId={selectedHighlightId!} highlightDescription={selectedHighlightDescription!} />
        }
      />
    </div>
  );
}
