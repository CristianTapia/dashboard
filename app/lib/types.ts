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
