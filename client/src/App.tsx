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
      <div className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden relative text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 w-full max-w-lg"
        >
          <Card className="bg-card/50 backdrop-blur-2xl border-primary/20 shadow-[0_0_50px_-12px_rgba(37,99,235,0.2)] rounded-[2.5rem] overflow-hidden">
            <CardContent className="pt-12 pb-14 text-center space-y-8">
              <div className="relative w-24 h-24 mx-auto">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30"
                />
                <div className="absolute inset-2 bg-primary/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <AlertTriangle className="w-10 h-10 text-primary" />
                </div>
              </div>

              <div className="space-y-4">
                <motion.h1 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-black tracking-tighter uppercase bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent"
                >
                  Upgrading
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-muted-foreground text-lg leading-relaxed px-6"
                >
                  {maintenance.maintenanceMessage || "We're currently polishing the experience to make it even faster and more secure. Hang tight!"}
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Coming Back Soon
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              </motion.div>
            </CardContent>
          </Card>
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

import { Header } from "@/components/Header";

import { ThemeProvider } from "@/components/theme-provider";

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
