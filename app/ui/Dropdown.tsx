"use client";

import { ReactNode } from "react";

export default function Dropdown({
  isOpen,
  optionA,
  optionB,
  onOptionAClickAction,
  onOptionBClickAction,
  className,
  submenu,
}: {
  isOpen: boolean;
  optionA?: string;
  optionB?: string;
  onOptionAClickAction: () => void;
  onOptionBClickAction: () => void;
  className?: string;
  submenu?: ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div
      className={`absolute right-0 z-10 w-40 bg-white rounded-md shadow-lg border transition-all duration-200 transform opacity-100 scale-100 ${
        className ?? "top-[30px] mt-1"
      }`}
    >
      <ul className="py-1">
        <li
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
          onClick={onOptionAClickAction}
        >
          {optionA}
        </li>

        {/* Contenedor con submenu */}
        <li className="relative group">
          <div
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
            onClick={onOptionBClickAction}
          >
            {optionB}
          </div>

          {/* Submenú */}
          {submenu && (
            <div className="absolute left-full top-0 ml-1 w-40 bg-white border rounded-md shadow-lg hidden group-hover:block z-20">
              {submenu}
            </div>
          )}
        </li>
      </ul>
    </div>
  );
}
