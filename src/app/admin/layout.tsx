import { auth } from "@/lib/auth/auth";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return redirect("/signin");
  }
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="w-full p-10">{children}</SidebarInset>
    </SidebarProvider>
  );
}
