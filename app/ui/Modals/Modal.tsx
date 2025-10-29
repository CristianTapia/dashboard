"use client";

import { X } from "lucide-react";

export default function Modal({
  isOpen,
  onCloseAction,
  title,
  body,
  fixedBody,
  buttonAName,
  onButtonAClickAction,
  buttonBName,
  onButtonBClickAction,
}: {
  isOpen: boolean;
  onCloseAction: () => void;
  title?: string;
  body?: React.ReactNode;
  fixedBody?: React.ReactNode;
  buttonAName?: string;
  buttonBName?: string;
  onButtonAClickAction?: () => void;
  onButtonBClickAction?: () => void;
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
            <div className="flex pl-4 justify-between text-xl">
              <h1 className="text-2xl font-bold">{title}</h1>
              <button className="pr-4 text-gray-900 cursor-pointer" onClick={onCloseAction}>
                <X size={30} />
              </button>
            </div>
            {/* Modal body scrolleable*/}
            {body ? <div className="p-2 max-h-[70vh] overflow-y-auto">{body}</div> : null}

            {/* Model Body fijo */}
            {fixedBody ? <div className="p-4">{fixedBody}</div> : null}

            {/* Modal footer buttons*/}
            {buttonAName || buttonBName ? (
              <div className="pt-4 pl-4">
                {buttonAName ? (
                  <button onClick={onButtonAClickAction} className="p-2 bg-green-600 text-white rounded cursor-pointer">
                    {buttonAName}
                  </button>
                ) : null}

                {buttonBName ? (
                  <button
                    onClick={onButtonBClickAction}
                    className="p-2 bg-red-600 text-white rounded ml-2 cursor-pointer"
                  >
                    {buttonBName}
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
