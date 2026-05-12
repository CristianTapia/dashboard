import { requireAdmin } from "@/app/lib/auth";

export default async function Configuration() {
  await requireAdmin();

  return <div>Config</div>;
}
