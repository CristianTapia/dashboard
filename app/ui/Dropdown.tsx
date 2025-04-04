"use client";

export default function Dropdown({ isOpen }: { isOpen: boolean }) {
  return (
    <div
      className={`absolute right-0 top-[40px] z-10 mt-1 w-40 bg-white rounded-md shadow-lg border
          transition-all duration-200 transform
          ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
    >
      <ul className="py-1">
        <li className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">Editar</li>
        <li className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">Eliminar</li>
      </ul>
    </div>
  );
}
