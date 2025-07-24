"use client";

import { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";

export interface Category {
  value: number;
  label: string;
}

interface Props {
  value: Category | null;
  onChangeAction: (cat: Category | null) => void;
}

export default function CategorySelect({ value, onChangeAction }: Props) {
  const [options, setOptions] = useState<Category[]>([]);

  // Carga inicial de categorías
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((cats: { id: number; name: string }[]) => setOptions(cats.map((c) => ({ value: c.id, label: c.name }))));
  }, []);

  return (
    <CreatableSelect
      isClearable
      options={options}
      value={value}
      onChange={(opt) => onChangeAction(opt as Category | null)}
      onCreateOption={async (inputValue) => {
        // 1) Creamos la categoría en el back
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: inputValue }),
        });
        const newCat = await res.json(); // { id, name }
        const catOption = { value: newCat.id, label: newCat.name };
        // 2) Añadimos a las opciones y la seleccionamos
        setOptions((prev) => [...prev, catOption]);
        onChangeAction(catOption);
      }}
      placeholder="Selecciona o crea categoría…"
    />
  );
}
