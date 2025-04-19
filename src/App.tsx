
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MergePage from "./pages/tools/MergePage";
import ConvertToPage from "./pages/tools/ConvertToPage";
import NotFound from "./pages/NotFound";
import React from "react"; // Make sure React is imported

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/tools/merge" element={<MergePage />} />
        <Route path="/tools/convert-to" element={<ConvertToPage />} />
        {/* ADD OTHER TOOL ROUTES LATER */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
