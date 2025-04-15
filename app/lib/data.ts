export const productArray = [
  { id: 1, name: "Pizza Margarita", price: 12000, category: "Pizzas", stock: 10 },
  { id: 2, name: "Pizza Clásica", price: 10000, category: "Pizzas", stock: 15 },
  { id: 3, name: "Lomo Saltado", price: 15000, category: "Peruana", stock: 8 },
  { id: 4, name: "Ceviche Mixto", price: 18000, category: "Peruana", stock: 6 },
  { id: 5, name: "Ensalada César", price: 8000, category: "Ensaladas", stock: 20 },
  { id: 6, name: "Tacos al Pastor", price: 12000, category: "Mexicana", stock: 12 },
  { id: 7, name: "Sushi Roll Philadelphia", price: 14000, category: "Japonesa", stock: 10 },
  { id: 8, name: "Churrasco con Papas", price: 20000, category: "Carnes", stock: 5 },
  { id: 9, name: "Lasagna de Carne", price: 16000, category: "Pastas", stock: 9 },
  { id: 10, name: "Tiramisú", price: 7000, category: "Postres", stock: 18 },
  { id: 11, name: "Ravioles de Espinaca", price: 13500, category: "Pastas", stock: 11 },
  { id: 12, name: "Churros con Manjar", price: 6000, category: "Postres", stock: 22 },
  { id: 13, name: "Arepas Rellenas", price: 10000, category: "Venezolana", stock: 14 },
  { id: 14, name: "Pollo Teriyaki", price: 14500, category: "Japonesa", stock: 7 },
  { id: 15, name: "Nachos con Queso", price: 7500, category: "Mexicana", stock: 16 },
];

const mesaNumbers = [
  3, 5, 7, 10, 12, 14, 17, 19, 21, 24, 26, 28, 30, 33, 35, 38, 40, 43, 45, 48, 50, 53, 55, 58, 60, 63, 65, 68, 70, 72,
  75, 78, 80, 83, 85, 88, 90, 93, 95, 98, 100, 103, 105, 108, 110, 113, 115, 118, 120, 123,
];

export const tablesArray = mesaNumbers.map((num, index) => ({
  id: index + 1,
  number: num,
  name: `Mesa ${num}`,
}));
