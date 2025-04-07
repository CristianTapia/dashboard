"use client";

export default function Modal({
  children,
  isOpen,
  onCloseAction,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onCloseAction: () => void;
}) {
  return (
    <>
      {isOpen && (
        // Cierra el modal al hacer clic fuera
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/60 transition-opacity"
          onClick={onCloseAction}
        >
          {/* Evita que el click dentro del modal lo cierre */}
          <div className="bg-white p-6 rounded-lg w-96" onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex pl-4 pb-6 justify-between text-xl">
              <h2 className="text-gray-900">Agregar Mesa</h2>
              <button className="pr-4 text-gray-900" onClick={onCloseAction}>
                X
              </button>
            </div>
            {/* Modal body */}
            <div className="p-4">{children}</div>
            {/* Modal footer */}
            <div className="pt-4 pl-4">
              <button className="p-2 bg-green-600 text-white rounded">Agregar</button>
              <button onClick={onCloseAction} className="p-2 bg-red-600 text-white rounded ml-2">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
