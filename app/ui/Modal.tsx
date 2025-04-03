"use client";

export default function Modal({ isOpen, onCloseAction }: { isOpen: boolean; onCloseAction: () => void }) {
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
            <div className="p-4">
              <div className="sm:col-span-4 pb-4">
                <label className="text-sm/6 font-medium text-gray-900">Numero de Mesa *</label>
                <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                  <input
                    type="number"
                    className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                  />
                </div>
              </div>
              <div className="sm:col-span-4">
                <label className="text-sm/6 font-medium text-gray-900">Nombre de la Mesa</label>
                <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                  <input
                    type="text"
                    className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                    placeholder="Opcional"
                  />
                </div>
              </div>
            </div>
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
