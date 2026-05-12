import { requireAdmin } from "@/app/lib/auth";

export default async function Overview() {
  await requireAdmin();

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap gap-8 justify-center">
        <div className="relative box-border border p-4 rounded shadow-md bg-gray w-[400px]">
          <div className="flex justify-between items-center mb-5">📊 Estádisticas mensuales</div>
          <div className="flex justify-between items-center mb-5">🧾 Ventas </div>
          <div className="flex items-end">
            <div className="text-xl leading-none">$40.000.000</div>
            <div className="text-xs ml-2">+2.5% ⬆️</div>
          </div>
          <div className="text-xs mt-4">Comparado con $35M mes pasado</div>
          <hr className="my-8 border-t border-gray-300" />
          <div className="flex justify-between items-center mb-5"> 🍽️ Platos más populares </div>
          <div className="flex box-border border border-gray-300 p-2 rounded">
            <div className="box-border border border-amber-300 p-5 mr-2">Foto</div>
            <div className="self-center">
              <div className="font-bold">Nombre del plato</div>
              <div className="text-sm">500 veces ordenado</div>
            </div>
          </div>
        </div>
        <div className="relative box-border border p-4 rounded shadow-md bg-gray w-[400px]">
          <div className="flex justify-between items-center mb-5">📊 Estádisticas semanales</div>
          <div className="flex justify-between items-center mb-5">🧾 Ventas </div>
          <div className="flex items-end">
            <div className="text-xl leading-none">$40.000.000</div>
            <div className="text-xs ml-2">+2.5% ⬆️</div>
          </div>
          <div className="text-xs mt-4">Comparado con $35M mes pasado</div>
          <hr className="my-8 border-t border-gray-300" />
          <div className="flex justify-between items-center mb-5"> 🍽️ Platos más populares </div>
          <div className="flex box-border border border-gray-300 p-2 rounded">
            <div className="box-border border border-amber-300 p-5 mr-2">Foto</div>
            <div className="self-center">
              <div className="font-bold">Nombre del plato</div>
              <div className="text-sm">500 veces ordenado</div>
            </div>
          </div>
        </div>
        <div className="relative box-border border p-4 rounded shadow-md bg-gray w-[400px]">
          <div className="flex justify-between items-center mb-5">📊 Estádisticas diarias</div>
          <div className="flex justify-between items-center mb-5">🧾 Ventas </div>
          <div className="flex items-end">
            <div className="text-xl leading-none">$40.000.000</div>
            <div className="text-xs ml-2">+2.5% ⬆️</div>
          </div>
          <div className="text-xs mt-4">Comparado con $35M mes pasado</div>
          <hr className="my-8 border-t border-gray-300" />
          <div className="flex justify-between items-center mb-5"> 🍽️ Platos más populares </div>
          <div className="flex box-border border border-gray-300 p-2 rounded">
            <div className="box-border border border-amber-300 p-5 mr-2">Foto</div>
            <div className="self-center">
              <div className="font-bold">Nombre del plato</div>
              <div className="text-sm">500 veces ordenado</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
