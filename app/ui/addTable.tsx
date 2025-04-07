export default function AddTable() {
  return (
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
  );
}
