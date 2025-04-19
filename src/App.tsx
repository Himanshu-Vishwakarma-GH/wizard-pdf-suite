
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MergePage from "./pages/tools/MergePage";
import ConvertToPage from "./pages/tools/ConvertToPage";
import SplitPage from "./pages/tools/SplitPage";
import CompressPage from "./pages/tools/CompressPage";
import ConvertFromPage from "./pages/tools/ConvertFromPage";
import RotatePage from "./pages/tools/RotatePage";
import WatermarkPage from "./pages/tools/WatermarkPage";
import ProtectPage from "./pages/tools/ProtectPage";
import UnlockPage from "./pages/tools/UnlockPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tools/merge" element={<MergePage />} />
          <Route path="/tools/split" element={<SplitPage />} />
          <Route path="/tools/compress" element={<CompressPage />} />
          <Route path="/tools/convert-to" element={<ConvertToPage />} />
          <Route path="/tools/convert-from" element={<ConvertFromPage />} />
          <Route path="/tools/rotate" element={<RotatePage />} />
          <Route path="/tools/watermark" element={<WatermarkPage />} />
          <Route path="/tools/protect" element={<ProtectPage />} />
          <Route path="/tools/unlock" element={<UnlockPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
