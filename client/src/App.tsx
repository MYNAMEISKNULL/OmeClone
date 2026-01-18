import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Chat from "@/pages/Chat";
import Info from "@/pages/Info";
import Safety from "@/pages/support/Safety";
import Feedback from "@/pages/support/Feedback";
import Contact from "@/pages/support/Contact";
import AdminDashboard from "@/pages/AdminDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

import MaintenancePage from "@/pages/Maintenance";
import { UIModeProvider } from "@/hooks/use-ui-mode";

function Router() {
  const [location] = useLocation();
  const { data: maintenance, isLoading } = useQuery<{ maintenanceMode: string; maintenanceMessage: string }>({
    queryKey: ["/api/maintenance"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary"
        />
      </div>
    );
  }

  if (maintenance?.maintenanceMode === "on" && location !== "/admin") {
    return <MaintenancePage />;
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/chat" component={Chat} />
      <Route path="/info" component={Info} />
      <Route path="/safety" component={Safety} />
      <Route path="/feedback" component={Feedback} />
      <Route path="/contact" component={Contact} />
      <Route path="/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

import { Header } from "./components/Header";
import { ThemeProvider } from "./components/theme-provider";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UIModeProvider>
        <ThemeProvider defaultTheme="dark" storageKey="nexus-theme">
          <TooltipProvider delayDuration={0}>
            <Header />
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </UIModeProvider>
    </QueryClientProvider>
  );
}

export default App;
