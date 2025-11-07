"use client";

import { X, Upload } from "lucide-react";

const baseClassNameButton = "flex px-4 p-3 gap-2 rounded-xl cursor-pointer";

export default function Modal({
  isOpen,
  onCloseAction,
  icon,
  title,
  body,
  fixedBody,
  buttonAName,
  buttonAIcon,
  buttonAOptionalClassName,
  onButtonAClickAction,
  buttonBName,
  buttonBIcon,
  buttonBOptionalClassName,
  onButtonBClickAction,
}: {
  isOpen: boolean;
  onCloseAction: () => void;
  icon?: React.ReactNode;
  title?: string;
  body?: React.ReactNode;
  fixedBody?: React.ReactNode;
  buttonAName?: React.ReactNode;
  buttonBName?: React.ReactNode;
  buttonAIcon?: React.ReactNode;
  buttonBIcon?: React.ReactNode;
  onButtonAClickAction?: () => void;
  onButtonBClickAction?: () => void;
  buttonAOptionalClassName?: string;
  buttonBOptionalClassName?: string;
}) {
  return (
    <>
      {isOpen && (
        // Cierra el modal al hacer clic fuera
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity"
          onClick={onCloseAction}
        >
          {/* Evita que el click dentro del modal lo cierre */}
          <div className="bg-white p-6 rounded-lg w-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex pt-4 justify-center">
              <div className="bg-[var(--color-bg-selected)] rounded-full p-3">{icon}</div>
            </div>
            <div className="flex p-4 justify-between">
              <h1 className="text-md font-bold">{title}</h1>
              <button className="text-gray-900 cursor-pointer" onClick={onCloseAction}>
                <X size={24} />
              </button>
            </div>
            {/* Modal body scrolleable*/}
            {body ? <div className="p-4 max-h-[70vh] overflow-y-auto">{body}</div> : null}

            {/* Model Body fijo */}
            {fixedBody ? <div className="px-4">{fixedBody}</div> : null}

            {/* Modal footer buttons*/}
            {buttonAName || buttonBName ? (
              <div className="flex gap-4 px-4 text-sm font-bold justify-center">
                {buttonAName ? (
                  <button
                    onClick={onButtonAClickAction}
                    className={`${baseClassNameButton} ${buttonAOptionalClassName ?? ""}`}
                  >
                    {buttonAIcon} {buttonAName}
                  </button>
                ) : null}

                {buttonBName ? (
                  <button
                    onClick={onButtonBClickAction}
                    className={`${baseClassNameButton} ${buttonBOptionalClassName ?? ""}`}
                  >
                    {buttonBIcon} {buttonBName}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
