import type { Metadata } from "next";
import { AgencySidebar } from "@/components/agency/sidebar";

export const metadata: Metadata = {
  title: "Agency Dashboard — NovaFans",
  description: "Manage your creator clients with NovaFans agency dashboard.",
};

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AgencySidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
