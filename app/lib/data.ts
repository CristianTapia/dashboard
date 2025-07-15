export const productsInCart = [
  { id: 1, name: "Ceviche Mixto Con Tallarines", quantity: 2, price: 8500 },
  { id: 2, name: "Lomo Saltado", quantity: 3, price: 9500 },
  { id: 3, name: "Pollo a la Brasa", quantity: 4, price: 7500 },
  { id: 4, name: "Tallarines Verdes", quantity: 5, price: 6800 },
  { id: 5, name: "Arroz Chaufa", quantity: 1, price: 7000 },
  { id: 6, name: "Anticuchos", quantity: 1, price: 6200 },
  { id: 7, name: "Pescado Frito", quantity: 1, price: 8000 },
  { id: 8, name: "Papa a la Huancaína", quantity: 3, price: 4500 },
  { id: 9, name: "Ocopa Arequipeña", quantity: 1, price: 4200 },
  { id: 10, name: "Ají de Gallina", quantity: 1, price: 7200 },
  { id: 11, name: "Causa Limeña", quantity: 2, price: 5000 },
  { id: 12, name: "Chicharrón de Calamar", quantity: 4, price: 8700 },
  { id: 13, name: "Tiradito", quantity: 3, price: 9000 },
  { id: 14, name: "Seco de Res", quantity: 1, price: 7900 },
  { id: 15, name: "Jalea Mixta", quantity: 2, price: 9900 },
];

const mesaNumbers = [
  3, 5, 7, 10, 12, 14, 17, 19, 21, 24, 26, 28, 30, 33, 35, 38, 40, 43, 45, 48, 50, 53, 55, 58, 60, 63, 65, 68, 70, 72,
  75, 78, 80, 83, 85, 88, 90, 93, 95, 98, 100, 103, 105, 108, 110, 113, 115, 118, 120, 123,
];

const mesaNames = [
  "Sol",
  "Luna",
  "Mar",
  "Cielo",
  "Bosque",
  "Río",
  "Montaña",
  "Arena",
  "Estrella",
  "Nube",
  "Fuego",
  "Brisa",
  "Trueno",
  "Rocío",
  "Aurora",
];

export const tablesArray = mesaNumbers.map((num, index) => ({
  id: index + 1,
  number: num,
  name: `${mesaNames[index % mesaNames.length]}`,
  stock: ["Bajo", "Medio", "Alto"][index % 3],
  assistance: index % 2 === 0 ? 1 : 0,
  check: index % 2 === 0 ? 0 : 1,
}));
