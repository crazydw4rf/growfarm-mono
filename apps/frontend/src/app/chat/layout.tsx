import DashboardLayout from "@/components/dashboard-layout";
import { ReactNode } from "react";

interface ChatLayoutProps {
  children: ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <DashboardLayout>
      <div className="h-full w-full max-w-none mx-0 px-0 overflow-hidden">{children}</div>
    </DashboardLayout>
  );
}
