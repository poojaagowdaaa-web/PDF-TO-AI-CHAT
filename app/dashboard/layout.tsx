import { ClerkLoaded } from "@clerk/nextjs";
import Header from "@/components/Header";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkLoaded>
      <div className="h-screen flex flex-col overflow-hidden bg-background">
        <Header />
        <div className="flex-1 w-full flex flex-col mx-auto gap-6 md:gap-8 p-4 md:p-6 lg:p-8 min-h-0 overflow-hidden max-w-7xl relative">
          {children}
        </div>
      </div>
    </ClerkLoaded>
  );
}

export default DashboardLayout;
