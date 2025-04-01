import { tablesArray } from "../lib/data";

export default function Tables() {
  return (
    <>
      {tablesArray.map((option) => (
        <div key={option.id} className="box-border size-40 border-1 p-4 justify-center">
          <div>Mesa {option.id}</div>
          <div>
            <button>Atención</button>
            <button>Cuenta</button>
          </div>
        </div>
      ))}
    </>
  );
}
