import { getAdminUsers } from "@/lib/admin-data";
import { UsersTable } from "@/components/admin/users-table";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Every host who has signed up for Hours. &quot;Next payment due&quot; isn&apos;t shown — Hours is a
        one-time lifetime purchase, so there is no recurring due date.
      </p>

      <div className="mt-8">
        <UsersTable users={users} />
      </div>
    </div>
  );
}
