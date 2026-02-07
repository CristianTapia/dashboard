import UsersClient from "@/app/ui/UsersClient";
import { listUsers } from "@/app/lib/data/users";

export default async function UsersPage() {
  const users = await listUsers();
  return <UsersClient initialUsers={users} />;
}
