import UsersClient from "@/app/ui/UsersClient";
import { listUsers } from "@/app/lib/data/users";
import { requireAdmin } from "@/app/lib/auth";

export default async function UsersPage() {
  await requireAdmin();
  const users = await listUsers();
  return <UsersClient initialUsers={users} />;
}
