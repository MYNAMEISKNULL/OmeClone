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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 transition-colors duration-500">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="relative w-16 h-16 mx-auto mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase tracking-widest">
              Maintenance
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed px-4">
              {maintenance.maintenanceMessage || "We're currently improving the platform. We'll be back shortly."}
            </p>
          </div>

          <div className="pt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-[10px] font-bold uppercase tracking-wider text-primary">
              <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
              Coming back soon
            </div>
          </div>
        </motion.div>
      </div>
    );
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
      <ThemeProvider defaultTheme="dark" storageKey="nexus-theme">
        <TooltipProvider delayDuration={0}>
          <Header />
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
