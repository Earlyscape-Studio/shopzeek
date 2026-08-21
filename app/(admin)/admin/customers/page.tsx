import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { cookies } from "next/headers";
import { Users } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 20;

export default async function CustomersPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { count: totalCustomers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // Signups — name/created_at come from `profiles`; email isn't a
  // profiles column, it lives in Supabase auth.users, so it needs the
  // service-role client.
  const { data: signupProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, created_at")
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  const signups = await Promise.all(
    (signupProfiles ?? []).map(async (profile) => {
      const { data } = await supabaseAdmin.auth.admin.getUserById(profile.id);
      return {
        id: profile.id,
        fullName: profile.full_name,
        createdAt: profile.created_at,
        email: data.user?.email ?? null,
      };
    })
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 mt-1">
          Everyone who has signed up to Shop Zeek.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            Total Customers
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {totalCustomers || 0}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Recent Signups</h2>
        </div>

        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-600">Name</TableHead>
              <TableHead className="font-semibold text-gray-600">Email</TableHead>
              <TableHead className="text-right font-semibold text-gray-600">Signed Up</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {signups.length > 0 ? (
              signups.map((signup) => (
                <TableRow key={signup.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900 text-sm">
                    {signup.fullName || "—"}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {signup.email || "—"}
                  </TableCell>
                  <TableCell className="text-right text-gray-500 text-sm">
                    {new Date(signup.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-gray-500">
                  No signups found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}