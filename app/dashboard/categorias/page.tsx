import { listCategories } from "@/app/lib/data";
import CategoriesClient from "@/app/ui/CategoriesClient";

export default async function CategoriesPage() {
  const categories = await listCategories(); // server-only helper

  return <CategoriesClient categories={categories} />;
}
