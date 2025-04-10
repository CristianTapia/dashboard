"use client";

export default function Dropdown({ isOpen, onDeleteAction }: { isOpen: boolean; onDeleteAction: () => void }) {
  if (!isOpen) return null; // No renderiza el dropdown si está cerrado

  return (
    <div
      className="absolute right-0 top-[30px] z-10 mt-1 w-40 bg-white rounded-md shadow-lg border
          transition-all duration-200 transform
          opacity-100 scale-100"
    >
      <ul className="py-1">
        <li className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">Editar</li>
        <li
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
          onClick={() => {
            onDeleteAction();
          }}
        >
          Eliminar
        </li>
      </ul>
    </div>
  );
}
