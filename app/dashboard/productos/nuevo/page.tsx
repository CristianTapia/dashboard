import AddProducts from "@/app/ui/AddProducts";
import { listCategories } from "@/app/lib/data/categories";

export default async function AddProductsPage() {
  const categories = await listCategories(); // server-only helper
  return <AddProducts categories={categories} />;
}
