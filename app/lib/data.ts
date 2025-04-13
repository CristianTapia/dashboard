export const productArray = [
  { id: 1, name: "Pizza Margarita", price: 12000, category: "Pizzas" },
  { id: 2, name: "Pizza Clásica", price: 10000, category: "Pizzas" },
  { id: 3, name: "Lomo Saltado", price: 15000, category: "Peruana" },
  { id: 4, name: "Ceviche Mixto", price: 18000, category: "Peruana" },
  { id: 5, name: "Ensalada César", price: 8000, category: "Ensaladas" },
  { id: 6, name: "Tacos al Pastor", price: 12000, category: "Mexicana" },
  { id: 7, name: "Sushi Roll Philadelphia", price: 14000, category: "Japonesa" },
  { id: 8, name: "Churrasco con Papas", price: 20000, category: "Carnes" },
  { id: 9, name: "Lasagna de Carne", price: 16000, category: "Pastas" },
  { id: 10, name: "Tiramisú", price: 7000, category: "Postres" },
];

export const tablesArray = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  number: Math.floor(Math.random() * 100) + 1, // número aleatorio entre 1 y 100
  name: `Nombre ${i + 1}`,
}));
