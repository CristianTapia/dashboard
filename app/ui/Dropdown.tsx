"use client";

import { ReactNode } from "react";
import { forwardRef } from "react";

type DropdownProps = {
  isOpen: boolean;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  onOptionAClickAction?: () => void;
  onOptionBClickAction?: () => void;
  onOptionCClickAction?: () => void;
  className?: string;
  submenu?: ReactNode;
};

const Dropdown = forwardRef(function Dropdown(
  {
    isOpen,
    optionA,
    optionB,
    optionC,
    onOptionAClickAction,
    onOptionBClickAction,
    onOptionCClickAction,
    className,
    submenu,
  }: DropdownProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={`absolute right-0 z-50 w-40 bg-white rounded-md shadow-lg border transition-all duration-200 transform opacity-100 scale-100 ${
        className ?? "top-[40px] mt-1"
      }`}
    >
      <ul className="py-1">
        <li
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
          onClick={onOptionAClickAction}
        >
          {optionA}
        </li>
        {optionB && (
          <li
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
            onClick={onOptionBClickAction}
          >
            {optionB}
          </li>
        )}

        {/* Contenedor con submenu */}
        {optionC && (
          <li className="relative group">
            <div
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              onClick={onOptionCClickAction}
            >
              {optionC}
            </div>

            {/* Submenú */}
            {submenu && (
              <div className="absolute left-full top-0 ml-1 w-40 bg-white border rounded-md shadow-lg hidden group-hover:block z-20">
                {submenu}
              </div>
            )}
          </li>
        )}
      </ul>
    </div>
  );
});

export default Dropdown;
