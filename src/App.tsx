import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { FilterProvider } from "@/contexts/FilterContext";
import DashboardLayout from "@/components/DashboardLayout";
import Overview from "@/pages/Overview";
import RegionalAnalysis from "@/pages/RegionalAnalysis";
import EnterpriseAnalysis from "@/pages/EnterpriseAnalysis";
import TradeIntelligence from "@/pages/TradeIntelligence";
import Publications from "@/pages/Publications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <FilterProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Overview />} />
                <Route path="/regional" element={<RegionalAnalysis />} />
                <Route path="/enterprise" element={<EnterpriseAnalysis />} />
                <Route path="/intelligence" element={<TradeIntelligence />} />
                <Route path="/publications" element={<Publications />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </FilterProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
