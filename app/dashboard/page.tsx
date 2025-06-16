export default function Overview() {
  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap gap-8">
        <div className="relative box-border border p-4 rounded shadow-md bg-gray w-[400px]">
          <div className="flex justify-between items-center mb-5">🧾 Venta mensual</div>
          <div className="flex items-end justify-between">
            <div className="justify-end">$40.000.000</div>
            <div className="text-xs justify-end">+2.5% ⬆️</div>
          </div>
          <div className="text-xs mt-2">Comparado con $35M mes pasado</div>
        </div>
        <div className="relative box-border border p-4 rounded shadow-md bg-gray w-[400px]">
          <div className="flex justify-between items-center mb-5">🧾 Venta semanal</div>
          <div className="flex">
            <div className="mr-2">$10.000.000</div>
            <div className="text-xs self-end">+1.5% ⬆️</div>
          </div>
          <div className="text-xs mt-2">Comparado con $5M semana pasada</div>
        </div>
        <div className="relative box-border border p-4 rounded shadow-md bg-gray w-[400px]">
          <div className="flex justify-between items-center mb-5">🧾 Venta diaria</div>
          <div className="flex">
            <div className="mr-2">$5.000.000</div>
            <div className="text-xs self-end">+1% ⬆️</div>
          </div>
          <div className="text-xs mt-2">Comparado con $2M año pasado</div>
        </div>
      </div>
    </div>
  );
}
