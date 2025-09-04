export type Product = {
  id: number;
  name: string;
  price: number;
  stock?: number;
  description?: string;
  category: {
    id: number;
    name: string;
  };
  image_url?: string | null;
};

export type Category = {
  id: number;
  name: string;
};

// interface Product {
//   id: number;
//   name: string;
//   price: number;
//   category: string;
//   stock?: number;
//   description?: string;
//   image_url?: string | null;
// }

// interface Category {
//   id: number;
//   name: string;
// }
