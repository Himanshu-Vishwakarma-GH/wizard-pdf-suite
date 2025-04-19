
import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ToolLayoutProps {
  children: ReactNode;
}

const ToolLayout = ({ children }: ToolLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-white to-primary/5">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default ToolLayout;
