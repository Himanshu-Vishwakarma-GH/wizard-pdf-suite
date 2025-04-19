
import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ToolLayoutProps {
  children: ReactNode;
}

const ToolLayout = ({ children }: ToolLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-background to-background/95 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default ToolLayout;
