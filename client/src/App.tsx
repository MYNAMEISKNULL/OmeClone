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
      <div className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden relative text-white selection:bg-primary/30">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[140px]" 
          />
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, -50, 0],
              y: [0, -40, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/15 rounded-full blur-[140px]" 
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-lg"
        >
          <Card className="bg-neutral-900/40 backdrop-blur-3xl border-white/5 shadow-[0_0_80px_-20px_rgba(37,99,235,0.3)] rounded-[3rem] overflow-hidden">
            <CardContent className="pt-16 pb-16 text-center space-y-10">
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                {/* Outer rotating ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-primary/20"
                />
                {/* Inner pulsing ring */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-2 rounded-full border-4 border-primary/10"
                />
                <div className="relative z-10 w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center backdrop-blur-md rotate-12 group hover:rotate-0 transition-transform duration-500">
                  <AlertTriangle className="w-8 h-8 text-primary -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                </div>
              </div>

              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h1 className="text-5xl font-black tracking-tight uppercase bg-gradient-to-b from-white via-white to-white/20 bg-clip-text text-transparent">
                    Polishing
                  </h1>
                </motion.div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-neutral-400 text-lg leading-relaxed px-8 font-medium"
                >
                  {maintenance.maintenanceMessage || "We're perfecting every detail to bring you the fastest and most secure experience. We'll be back in a flash."}
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="inline-flex items-center justify-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-[0.4em] text-primary"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Live Updates
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
