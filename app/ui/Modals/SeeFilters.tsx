export default function SeeFilters() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Filtros</h2>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input type="checkbox" id="filter1" />
          <label htmlFor="filter1">Filtro 1</label>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="filter2" />
          <label htmlFor="filter2">Filtro 2</label>
        </div>
      </div>
    </div>
  );
}
