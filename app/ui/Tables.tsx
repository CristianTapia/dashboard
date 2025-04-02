import { tablesArray } from "../lib/data";

export default function Tables() {
  return (
    <>
      <div className="flex flex-col">
        <div className="text-white flex items-center gap-4 pb-4">
          <button className="bg-red-500 border-1 p-2">Agregar Mesa</button>
          <input className="border-1  p-2" type="search" placeholder="Buscar Mesa" />
        </div>

        <div className="flex flex-wrap gap-4 justify-center p-4">
          {tablesArray.map((option) => (
            <div key={option.id} className="box-border border p-4 rounded shadow-md bg-gray w-[200px]">
              <div className="flex justify-between items-center">
                <div className="w-32">Mesa {option.id}</div>
                <button className="bg-red-500 text-white px-2 py-1 rounded">O</button>
              </div>
              <div className="flex justify-center gap-2 p-4">
                <div className="p-2 box-border border rounded">Atención</div>
                <div className="p-2 box-border border rounded">Cuenta</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
