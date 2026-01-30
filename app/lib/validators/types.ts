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
  image_path?: string | null;
  image_url?: string | null;
};

export type Category = {
  id: number;
  name: string;
};

export type Highlight = {
  id: number;
  description: string;
  image_path?: string | null;
  image_url?: string | null;
};

export type User = {
  id: number;
  name: string;
};
