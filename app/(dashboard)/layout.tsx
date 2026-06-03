import { Sidebar, MobileSidebar, Header, MobileBottomNav } from "@/components/layout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex h-screen bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Mobile Header with Sidebar Toggle */}
          <div className="lg:hidden">
            <MobileSidebar />
          </div>

          {/* Desktop Header - hidden on mobile */}
          <div className="hidden lg:block">
            <Header />
          </div>

          <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 lg:pb-6">{children}</main>
        </div>
      </div>
      <MobileBottomNav />
    </>
  );
}
