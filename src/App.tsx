import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import { SessionProvider } from "./contexts/SessionContext";

// Import our new page components
import StartSessionPage from "./pages/StartSessionPage";
import ActiveSessionPage from "./pages/ActiveSessionPage";
import SessionSummaryPage from "./pages/SessionSummaryPage";
import SessionHistoryPage from "./pages/SessionHistoryPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SessionProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Main application routes */}
            <Route path="/" element={<StartSessionPage />} />
            <Route path="/session/:sessionId" element={<ActiveSessionPage />} />
            <Route path="/summary/:sessionId" element={<SessionSummaryPage />} />
            <Route path="/session/:sessionId/history" element={<SessionHistoryPage />} />
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
