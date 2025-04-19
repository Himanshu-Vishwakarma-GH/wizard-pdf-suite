
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ToolsGrid from "@/components/ToolsGrid";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <ToolsGrid />
      <Footer />
    </div>
  );
};

export default Index;
