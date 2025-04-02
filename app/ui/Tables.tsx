import { tablesArray } from "../lib/data";

export default function Tables() {
  return (
    <>
      <div className="flex flex-col">
        <div className="text-white flex items-center gap-4 pb-4">
          <button className="bg-red-500 border-1 p-2">Agregar Mesa</button>
          <input className="border-1  p-2" type="search" placeholder="Buscar Mesa" />
        </div>
        <div className="flex">
          {tablesArray.map((option) => (
            <div key={option.id} className="box-border size-46 border-1 p-4 rounded">
              <div className="flex">
                <div className="w-32 flex">Mesa {option.id}</div>
                <button>O</button>
              </div>
              <div className="flex justify-center gap-2 p-10">
                <div className="p-2 box-border border-1">Atención</div>
                <div className="p-2 box-border border-1">Cuenta</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
