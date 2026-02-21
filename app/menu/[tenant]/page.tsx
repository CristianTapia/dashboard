import { listPublicProductsByTenant, resolveTenantByPublicKey } from "@/app/lib/data/public-menu";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PublicMenuPage({ params }: { params: { tenant: string } }) {
  const tenantKey = decodeURIComponent(params.tenant);
  const tenant = await resolveTenantByPublicKey(tenantKey);

  if (!tenant) notFound();

  const products = await listPublicProductsByTenant(tenant.id, { limit: 200 });

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Menu de {tenant.name}</h1>
      <p className="text-sm opacity-70 mb-6">Productos disponibles</p>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {products.map((product) => (
          <article key={product.id} className="border rounded-xl p-4 bg-white">
            <h2 className="font-semibold text-lg">{product.name}</h2>
            <p className="text-sm opacity-70 mb-2">{product.category?.name ?? "Sin categoria"}</p>
            {product.description ? <p className="text-sm mb-2">{product.description}</p> : null}
            <p className="font-bold">${product.price}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
