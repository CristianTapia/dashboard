import { tablesArray } from "../lib/data";

export default function Tables() {
  return (
    <>
      {tablesArray.map((option) => (
        <div key={option.id} className="box-border size-32 border-1 p-4">
          Mesa {option.id}
        </div>
      ))}
    </>
  );
}
