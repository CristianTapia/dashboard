"use client";

export default function Modal({ isOpen, onCloseAction }: { isOpen: boolean; onCloseAction: () => void }) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity"
          onClick={onCloseAction} // Cierra el modal al hacer clic fuera
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-96"
            onClick={(e) => e.stopPropagation()} // Evita que el click dentro del modal lo cierre
          >
            <h2 className="text-xl font-bold mb-4">Agregar Mesa</h2>
            <p className="mb-4">Formulario</p>
            <button className="p-2 bg-green-600 text-white rounded">Agregar</button>
            <button onClick={onCloseAction} className="p-2 bg-red-600 text-white rounded ml-2">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
