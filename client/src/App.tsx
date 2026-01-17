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

function Router() {
  const [location] = useLocation();
  const { data: maintenance } = useQuery<{ maintenanceMode: string; maintenanceMessage: string }>({
    queryKey: ["/api/maintenance"],
  });

  if (maintenance?.maintenanceMode === "on" && location !== "/admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg border-destructive/20 shadow-2xl shadow-destructive/10">
          <CardContent className="pt-8 pb-10 text-center space-y-6">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-destructive animate-pulse" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tighter uppercase text-foreground">
                Maintenance Mode
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed px-4">
                {maintenance.maintenanceMessage || "We are currently performing maintenance. Please check back later."}
              </p>
            </div>
          </CardContent>
        </Card>
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
