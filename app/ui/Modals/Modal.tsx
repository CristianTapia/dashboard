"use client";

import { X } from "lucide-react";

const baseClassNameButton =
  "flex min-h-11 w-full sm:w-auto sm:min-w-40 items-center justify-center gap-2 rounded-xl px-4 py-3 cursor-pointer";

export default function Modal({
  isOpen,
  onCloseAction,
  icon,
  iconBgOptionalClassName,
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
  iconBgOptionalClassName?: string;
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
          className="fixed inset-0 z-50 flex items-end sm:items-start justify-center overflow-y-auto bg-black/60 transition-opacity"
          onClick={onCloseAction}
        >
          {/* Evita que el click dentro del modal lo cierre */}
          <div
            className="bg-white p-4 sm:p-6 rounded-t-2xl sm:rounded-lg w-full mx-0 sm:mx-4 my-0 sm:my-6 max-w-3xl max-h-[92dvh] sm:max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex justify-end mb-2 shrink-0">
              <button className=" text-gray-900 cursor-pointer" onClick={onCloseAction}>
                <X size={24} />
              </button>
            </div>

            <div className="flex justify-center shrink-0">
              <div className={`${iconBgOptionalClassName} rounded-full p-3`}>{icon}</div>
            </div>
            <div className="flex p-4 justify-center items-center gap-4 border-b border-[var(--color-border-box)] shrink-0">
              <h1 className="text-md font-bold">{title}</h1>
            </div>
            {/* Modal body scrolleable*/}
            {body ? <div className="p-2 sm:p-4 flex-1 min-h-0 overflow-y-auto">{body}</div> : null}

            {/* Model Body fijo */}
            {fixedBody ? <div className="px-2 sm:px-4 flex-1 min-h-0 overflow-y-auto">{fixedBody}</div> : null}

            {/* Modal footer buttons*/}
            {buttonAName || buttonBName ? (
              <div className="flex flex-col gap-3 px-2 pb-2 pt-4 text-sm font-bold sm:flex-row sm:justify-end sm:gap-4 sm:px-4 shrink-0">
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
