"use client";

import { X } from "lucide-react";

const baseClassNameButton = "flex p-3 gap-2 text-white rounded-xl cursor-pointer";

export default function Modal({
  isOpen,
  onCloseAction,
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
          <div className="bg-white p-6 rounded-lg w-96" onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex p-4 justify-between text-xl">
              <h1 className="text-xl font-bold">{title}</h1>
              <button className="text-gray-900 cursor-pointer" onClick={onCloseAction}>
                <X size={30} />
              </button>
            </div>
            {/* Modal body scrolleable*/}
            {body ? <div className="p-4 max-h-[70vh] overflow-y-auto">{body}</div> : null}

            {/* Model Body fijo */}
            {fixedBody ? <div className="px-4">{fixedBody}</div> : null}

            {/* Modal footer buttons*/}
            {buttonAName || buttonBName ? (
              <div className="flex gap-4 px-4">
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
