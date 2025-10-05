import ImageInput from "@/app/ui/Modals/ImageInput";

export default function Highlights() {
  return (
    <div className="mx-auto max-w-3xl pt-4 flex flex-col">
      <div className="flex flex-col items-start gap-2">
        <h1 className="text-3xl font-bold">Crear Destacados</h1>
        <p className="text-md text-[var(--color-txt-secondary)]">
          Crea y administra tus ofertas y platos destacados para que se puedan visualizar en el menú del consumidor.
        </p>
      </div>

      <form className="flex flex-col gap-6 mt-6">
        {/* Description */}
        <div className="flex flex-col">
          <label className="text-sm pb-2 font-semibold">Descripción *</label>
          <textarea
            name="description"
            // type="text"
            // value="{form.description}"
            className="form-textarea bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 h-24"
            // onChange="{handleChange}"
          />
        </div>

        <div className="col-span-full">
          <label className="block text-sm font-md font-semibold">Imagen</label>
          <div className="mt-2 flex justify-center rounded-lg border-2 border-dashed border-[var(--color-border-box)] px-6 py-10">
            <div className="text-center">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                data-slot="icon"
                aria-hidden="true"
                className="mx-auto size-12 text-gray-600"
              >
                <path
                  d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z"
                  clip-rule="evenodd"
                  fill-rule="evenodd"
                />
              </svg>
              <div className="mt-4 flex text-sm/6 text-gray-400">
                <label
                  // for="file-upload"
                  className="relative cursor-pointer rounded-md bg-transparent font-semibold text-[var(--color-txt-selected)] focus-within:outline-2 focus-within:outline-offset-2 hover:text-[var(--color-txt-selected/60)]"
                >
                  <span>Carga un archivo</span>
                  <input id="file-upload" type="file" name="file-upload" className="sr-only" />
                </label>
                <p className="pl-1 text-[var(--color-txt-secondary)]">o arrastra y suelta</p>
              </div>
              <p className="text-xs text-gray-400">PNG, JPG, GIF hasta 10MB</p>
            </div>
          </div>
        </div>

        {/* Imagen */}
        <ImageInput />

        {/* Send form button */}
        <button className="p-2 bg-[var(--color-button-send)] text-white rounded-xl ml-2 cursor-pointer ">Crear</button>
      </form>
    </div>
  );
}
