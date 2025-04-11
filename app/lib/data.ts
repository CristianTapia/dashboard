export const productArray = [
  { id: "p1", name: "Pizza Margarita", price: 12000, category: "Pizzas" },
  { id: "p2", name: "Pizza Clásica", price: 10000, category: "Pizzas" },
  { id: "p3", name: "Lomo Saltado", price: 15000, category: "Peruana" },
  { id: "p4", name: "Ceviche Mixto", price: 18000, category: "Peruana" },
  { id: "p5", name: "Ensalada César", price: 8000, category: "Ensaladas" },
  { id: "p6", name: "Tacos al Pastor", price: 12000, category: "Mexicana" },
  { id: "p7", name: "Sushi Roll Philadelphia", price: 14000, category: "Japonesa" },
  { id: "p8", name: "Churrasco con Papas", price: 20000, category: "Carnes" },
  { id: "p9", name: "Lasagna de Carne", price: 16000, category: "Pastas" },
  { id: "p10", name: "Tiramisú", price: 7000, category: "Postres" },
];

export const tablesArray = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  number: i + 1,
  name: `Nombre ${i + 1}`,
}));
