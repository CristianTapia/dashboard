"use client";

import { ReactNode } from "react";
import { forwardRef } from "react";

type DropdownProps = {
  isOpen: boolean;
  optionA?: ReactNode;
  optionB?: ReactNode;
  optionC?: string;
  onOptionAClickAction?: () => void;
  onOptionBClickAction?: () => void;
  onOptionCClickAction?: () => void;
  className?: string;
  submenu?: ReactNode;
  dropUp?: boolean;
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
    dropUp,
  }: DropdownProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={`absolute right-0 ${dropUp ? "bottom-full mb-1" : "top-full mt-1"} z-20 w-48 bg-white rounded-xl shadow-lg transition-all duration-200 ${
        className ?? ""
      }`}
      data-role="dropdown-menu"
    >
      <ul className="py-1">
        <li
          className="flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
          onClick={onOptionAClickAction}
        >
          {optionA}
        </li>
        {optionB && (
          <li
            className="flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
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
