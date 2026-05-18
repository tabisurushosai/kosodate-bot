import { MainSidebar } from "@/components/layout/main-sidebar";

export default function MainLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 md:flex">
      <MainSidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
