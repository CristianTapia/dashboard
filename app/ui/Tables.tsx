import { tablesArray } from "../lib/data";

export default function Tables() {
  return (
    <>
      {/* <div className="grid grid-rows-[10%, 90%]"> */}
      <header className="bg-green-800 text-white flex items-center">
        <div className="border-1  p-2">+</div>
        <input className="border-1  p-2" type="search" />
      </header>

      {tablesArray.map((option) => (
        <div key={option.id} className="box-border size-40 border-1 p-4 rounded">
          <div className="flex">
            <div className="w-32 flex">Mesa {option.id}</div>
            <button>O</button>
          </div>
          <div className="flex justify-center gap-2 p-8">
            <div className="p-2 box-border border-1">Atención</div>
            <div className="p-2 box-border border-1">Cuenta</div>
          </div>
        </div>
      ))}
      {/* </div> */}
    </>
  );
}
