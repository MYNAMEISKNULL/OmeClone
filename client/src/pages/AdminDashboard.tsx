import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { reports, feedback, admin, maintenanceHistory } from "@shared/schema";
import type { Report, Feedback, Admin } from "@shared/schema";
import { format } from "date-fns";
import { Shield, MessageSquare, Clock, Lock, Power, Activity, ListFilter, History, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ActionLoader, Skeleton } from "@/components/ui/loaders";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const { data: maintenanceData } = useQuery<{ maintenanceMode: string; maintenanceMessage: string; wordBlacklist: string }>({
    queryKey: ["/api/maintenance"],
  });

  const { data: stats } = useQuery<{ cpuUsage: number; memoryUsage: number; uptime: number; activeConnections: number }>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated,
    refetchInterval: 3000,
  });

  const { data: mHistory } = useQuery<any[]>({
    queryKey: ["/api/admin/maintenance/history"],
    enabled: isAuthenticated,
  });

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [wordBlacklist, setWordBlacklist] = useState("");

  useEffect(() => {
    if (maintenanceData) {
      setMaintenanceMode(maintenanceData.maintenanceMode === "on");
      setMaintenanceMessage(maintenanceData.maintenanceMessage);
      setWordBlacklist(maintenanceData.wordBlacklist || "");
    }
  }, [maintenanceData]);

  const updateMaintenanceMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/maintenance", {
        mode: maintenanceMode ? "on" : "off",
        message: maintenanceMessage,
        password,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/maintenance/history"] });
      toast({ title: "Success", description: "Maintenance settings updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update maintenance settings", variant: "destructive" });
    },
  });

  const updateBlacklistMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/blacklist", {
        list: wordBlacklist,
        password,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      toast({ title: "Success", description: "Word blacklist updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update word blacklist", variant: "destructive" });
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest("POST", "/api/admin/login", { password });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
      } else {
        toast({ title: "Error", description: "Invalid password", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Login failed", variant: "destructive" });
    }
  };

  const { data: reports, isLoading: loadingReports } = useQuery<Report[]>({
    queryKey: ["/api/admin/reports"],
    enabled: isAuthenticated,
  });

  const { data: feedback, isLoading: loadingFeedback } = useQuery<Feedback[]>({
    queryKey: ["/api/admin/feedback"],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 transition-colors duration-500">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm space-y-8"
        >
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase tracking-widest">Admin Access</h1>
            <p className="text-muted-foreground text-sm">Please authenticate to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Security Key"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background border-border rounded-xl h-12 text-center text-lg"
              required
            />
            <Button type="submit" className="w-full h-12 rounded-xl font-bold uppercase tracking-widest">
              Authenticate
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 transition-colors duration-500">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold tracking-tight uppercase tracking-widest">Control Panel</h1>
            </div>
            <p className="text-muted-foreground text-sm">System management and moderation</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">System Healthy</span>
          </div>
        </header>

        <Tabs defaultValue="reports" className="w-full space-y-8">
          <TabsList className="bg-muted/50 p-1 rounded-xl h-auto flex flex-wrap gap-1 border border-border">
            {[
              { id: 'reports', icon: Shield, label: 'Reports' },
              { id: 'feedback', icon: MessageSquare, label: 'Feedback' },
              { id: 'health', icon: Activity, label: 'Health' },
              { id: 'filters', icon: ListFilter, label: 'Filters' },
              { id: 'history', icon: History, label: 'History' },
              { id: 'maintenance', icon: Power, label: 'System' },
            ].map((tab) => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id} 
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg py-2 px-4 transition-all font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 border border-transparent data-[state=active]:border-border"
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="min-h-[400px]">
            <TabsContent value="reports" className="mt-0 outline-none">
              <div className="grid gap-3">
                {loadingReports ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="bg-card border-border rounded-xl">
                      <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full" />
                      </CardContent>
                    </Card>
                  ))
                ) : reports?.length === 0 ? (
                  <div className="py-20 text-center text-muted-foreground text-sm">No active reports</div>
                ) : (
                  reports?.map((report) => (
                    <Card key={report.id} className="bg-card border-border rounded-xl">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                          Report #{report.id}
                        </CardTitle>
                        <div className="flex items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest gap-1.5">
                          <Clock className="w-3 h-3" />
                          {format(new Date(report.createdAt!), "MMM d, h:mm a")}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm font-medium leading-relaxed">{report.reason}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="feedback" className="mt-0 outline-none">
              <div className="grid gap-3">
                {loadingFeedback ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="bg-card border-border rounded-xl">
                      <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-32" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full" />
                      </CardContent>
                    </Card>
                  ))
                ) : feedback?.length === 0 ? (
                  <div className="py-20 text-center text-muted-foreground text-sm">No user feedback</div>
                ) : (
                  feedback?.map((fb) => (
                    <Card key={fb.id} className="bg-card border-border rounded-xl">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-primary">
                          Rating: {fb.rating}/5
                        </CardTitle>
                        <div className="flex items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest gap-1.5">
                          <Clock className="w-3 h-3" />
                          {format(new Date(fb.createdAt!), "MMM d, h:mm a")}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm font-medium leading-relaxed">{fb.content}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="health" className="mt-0 outline-none">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'CPU', value: `${stats?.cpuUsage.toFixed(1)}%` },
                  { title: 'RAM', value: `${stats?.memoryUsage.toFixed(1)}%` },
                  { title: 'Users', value: stats?.activeConnections },
                  { title: 'Uptime', value: `${Math.floor((stats?.uptime || 0) / 3600)}h` },
                ].map((stat, i) => (
                  <Card key={i} className="bg-card border-border rounded-xl p-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.title}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="filters" className="mt-0 outline-none">
              <Card className="bg-card border-border rounded-xl max-w-2xl">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest">Word Filtering</CardTitle>
                  <CardDescription className="text-xs">Comma separated list of censored terms.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter words..."
                    value={wordBlacklist}
                    onChange={(e) => setWordBlacklist(e.target.value)}
                    className="bg-background border-border rounded-xl min-h-[160px] p-4 text-sm font-mono"
                  />
                  <Button 
                    onClick={() => updateBlacklistMutation.mutate()}
                    disabled={updateBlacklistMutation.isPending}
                    className="w-full h-11 rounded-xl font-bold uppercase tracking-widest"
                  >
                    {updateBlacklistMutation.isPending ? "Saving..." : "Update Filters"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="maintenance" className="mt-0 outline-none">
              <Card className="bg-card border-border rounded-xl max-w-2xl">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-destructive">System Maintenance</CardTitle>
                  <CardDescription className="text-xs">Take the platform offline for updates.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold">Lock Platform</Label>
                      <p className="text-[10px] text-muted-foreground">Redirect all users to maintenance screen</p>
                    </div>
                    <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Announcement</Label>
                    <Textarea
                      placeholder="Maintenance message..."
                      value={maintenanceMessage}
                      onChange={(e) => setMaintenanceMessage(e.target.value)}
                      className="bg-background border-border rounded-xl h-24 p-4 text-sm"
                    />
                  </div>
                  <Button 
                    onClick={() => updateMaintenanceMutation.mutate()}
                    disabled={updateMaintenanceMutation.isPending}
                    variant={maintenanceMode ? "destructive" : "default"}
                    className="w-full h-11 rounded-xl font-bold uppercase tracking-widest"
                  >
                    {updateMaintenanceMutation.isPending ? "Processing..." : "Apply Changes"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-0 outline-none">
               <div className="grid gap-2">
                {mHistory?.length === 0 ? (
                  <div className="py-20 text-center text-muted-foreground text-sm">No history logs</div>
                ) : (
                  mHistory?.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg text-[10px] font-bold uppercase tracking-widest">
                      <div className="flex items-center gap-3">
                        <span className={entry.mode === 'on' ? 'text-destructive' : 'text-primary'}>
                          {entry.mode === 'on' ? 'LOCKED' : 'ACTIVE'}
                        </span>
                        <span className="text-muted-foreground italic">"{entry.message || 'No msg'}"</span>
                      </div>
                      <span className="text-muted-foreground">
                        {format(new Date(entry.createdAt), "MMM d, HH:mm")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
