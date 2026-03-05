export type Product = {
  id: number;
  name: string;
  price: number;
  stock?: number;
  description?: string;
  tenant_id?: string | null;
  tenant?: {
    id: string;
    name: string;
  } | null;
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
  tenant_id?: string | null;
  tenant?: {
    id: string;
    name: string;
  } | null;
};

export type Highlight = {
  id: number;
  description: string;
  tenant_id?: string | null;
  tenant?: {
    id: string;
    name: string;
  } | null;
  image_path?: string | null;
  image_url?: string | null;
};

export type User = {
  id: string;
  name: string;
};

export type TenantOption = {
  id: string;
  name: string;
};
