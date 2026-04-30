import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { FilterProvider } from "@/contexts/FilterContext";
import DashboardLayout from "@/components/DashboardLayout";
import Overview from "@/pages/Overview";
import Publications from "@/pages/Publications";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

// Extend Window interface to include chatbase
declare global {
  interface Window {
    chatbase: any;
  }
}

const queryClient = new QueryClient();

const App = () => {
  // Chatbase script integration
  useEffect(() => {
    (function() {
      if (!window.chatbase || window.chatbase("getState") !== "initialized") {
        window.chatbase = (...args: any[]) => {
          if (!window.chatbase.q) {
            window.chatbase.q = [];
          }
          window.chatbase.q.push(args);
        };
        
        window.chatbase = new Proxy(window.chatbase, {
          get(target, prop) {
            if (prop === "q") {
              return target.q;
            }
            return (...args: any[]) => target(prop, ...args);
          }
        });
      }
      const onLoad = function() {
        const script = document.createElement("script");
        script.src = "https://www.chatbase.co/embed.min.js";
        script.id = "9TY1oIs3Em-oSq6VfxwpD";
        script.setAttribute("domain", "www.chatbase.co");
        document.body.appendChild(script);
      };
      if (document.readyState === "complete") {
        onLoad();
      } else {
        window.addEventListener("load", onLoad);
      }
    })();
  }, []);

  return (
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
};

export default App;