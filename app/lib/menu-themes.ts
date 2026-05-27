export const menuThemeOptions = [
  {
    value: "default",
    label: "Predeterminado",
    description: "Base limpia para uso diario. Mantiene la identidad principal del tenant sin decoracion estacional.",
    colors: ["#137fec", "#f7f8fb", "#111827"],
    details: ["Colores neutrales", "Contraste alto", "Ideal para todo el ano"],
  },
  {
    value: "summer",
    label: "Verano",
    description: "Theme luminoso para cartas de temporada, terrazas, bebidas frias y promociones estivales.",
    colors: ["#0ea5e9", "#facc15", "#14b8a6"],
    details: ["Azules frescos", "Acentos calidos", "Sensacion ligera y energica"],
  },
  {
    value: "winter",
    label: "Invierno",
    description: "Theme sobrio para menus de invierno, cafeterias, platos calientes y ofertas de temporada.",
    colors: ["#2563eb", "#e0f2fe", "#334155"],
    details: ["Azules profundos", "Fondos frios", "Acentos suaves"],
  },
  {
    value: "halloween",
    label: "Halloween",
    description: "Theme temporal para promociones especiales, cocteles tematicos y productos destacados.",
    colors: ["#7c3aed", "#f97316", "#18181b"],
    details: ["Contraste alto", "Acentos naranjos", "Uso recomendado por campana"],
  },
  {
    value: "christmas",
    label: "Navidad",
    description: "Theme festivo para menus navidenos, cenas especiales, packs y promociones de fin de ano.",
    colors: ["#dc2626", "#16a34a", "#f8fafc"],
    details: ["Rojo y verde controlado", "Fondos claros", "Acento festivo sin saturar"],
  },
] as const;

export type MenuTheme = (typeof menuThemeOptions)[number]["value"];

export function normalizeMenuTheme(value?: string | null): MenuTheme {
  return menuThemeOptions.some((option) => option.value === value) ? (value as MenuTheme) : "default";
}
