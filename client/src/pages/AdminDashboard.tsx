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
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden selection:bg-primary/30">
        {/* Background Glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[140px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-md"
        >
          <Card className="bg-neutral-900/40 backdrop-blur-3xl border-white/5 shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="text-center pt-10 pb-6">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-12 transition-transform hover:rotate-0 duration-500 group">
                <Lock className="w-8 h-8 text-primary -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
              </div>
              <CardTitle className="text-3xl font-black tracking-tighter uppercase bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
                Control Center
              </CardTitle>
              <CardDescription className="text-neutral-400 font-medium mt-2">
                Authorized Access Only
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-12 px-8">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Security Key"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border-white/10 rounded-2xl h-14 text-center text-lg tracking-widest focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:tracking-normal placeholder:text-neutral-600"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-14 rounded-2xl text-base font-black tracking-widest uppercase bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Authenticate
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 selection:bg-primary/30 selection:text-white relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[5%] right-[-5%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-neutral-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter uppercase">Admin Panel</h1>
            </div>
            <p className="text-neutral-400 font-medium">System status and community moderation</p>
          </div>
          <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/5">
            <div className="flex flex-col items-end px-4">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Server Status</span>
              <span className="text-sm font-black text-white">Online & Healthy</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2" />
          </div>
        </header>

        <Tabs defaultValue="reports" className="w-full space-y-8">
          <TabsList className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 p-1.5 rounded-2xl h-auto grid grid-cols-2 md:flex md:flex-wrap gap-1">
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
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl py-3 px-6 transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-2"
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="min-h-[400px]">
            <TabsContent value="reports" className="mt-0 outline-none">
              <div className="grid gap-4">
                {loadingReports ? (
                  <div className="flex justify-center py-20"><Activity className="w-8 h-8 animate-spin text-primary" /></div>
                ) : reports?.length === 0 ? (
                  <Card className="bg-neutral-900/20 border-white/5 rounded-3xl"><CardContent className="py-20 text-center text-neutral-500 font-medium">No active reports at this time.</CardContent></Card>
                ) : (
                  reports?.map((report) => (
                    <Card key={report.id} className="bg-neutral-900/40 backdrop-blur-sm border-white/5 rounded-[1.5rem] hover:bg-neutral-900/60 transition-colors">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                          <span className="w-8 h-8 bg-destructive/20 rounded-lg flex items-center justify-center">
                            <Shield className="w-4 h-4 text-destructive" />
                          </span>
                          Report #{report.id}
                        </CardTitle>
                        <div className="flex items-center text-[10px] font-bold text-neutral-500 uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded-full border border-white/5 gap-2">
                          <Clock className="w-3 h-3" />
                          {format(new Date(report.createdAt!), "MMM d, h:mm a")}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-neutral-300 font-medium leading-relaxed">{report.reason}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="feedback" className="mt-0 outline-none">
              <div className="grid gap-4">
                {loadingFeedback ? (
                  <div className="flex justify-center py-20"><Activity className="w-8 h-8 animate-spin text-primary" /></div>
                ) : feedback?.length === 0 ? (
                  <Card className="bg-neutral-900/20 border-white/5 rounded-3xl"><CardContent className="py-20 text-center text-neutral-500 font-medium">No user feedback received yet.</CardContent></Card>
                ) : (
                  feedback?.map((fb) => (
                    <Card key={fb.id} className="bg-neutral-900/40 backdrop-blur-sm border-white/5 rounded-[1.5rem] hover:bg-neutral-900/60 transition-colors">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                          <span className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-primary" />
                          </span>
                          Rating: {fb.rating}/5
                        </CardTitle>
                        <div className="flex items-center text-[10px] font-bold text-neutral-500 uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded-full border border-white/5 gap-2">
                          <Clock className="w-3 h-3" />
                          {format(new Date(fb.createdAt!), "MMM d, h:mm a")}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-neutral-300 font-medium leading-relaxed">{fb.content}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="health" className="mt-0 outline-none">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'CPU Usage', value: `${stats?.cpuUsage.toFixed(2)}%`, sub: 'System Load', icon: Activity },
                  { title: 'Memory', value: `${stats?.memoryUsage.toFixed(1)}%`, sub: 'RAM in Use', icon: Activity },
                  { title: 'Active Sessions', value: stats?.activeConnections, sub: 'Live Users', icon: Users },
                  { title: 'Server Uptime', value: `${Math.floor((stats?.uptime || 0) / 3600)}h`, sub: 'Total Runtime', icon: Clock },
                ].map((stat, i) => (
                  <Card key={i} className="bg-neutral-900/40 backdrop-blur-sm border-white/5 rounded-[2rem] p-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">{stat.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{stat.sub}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="filters" className="mt-0 outline-none">
              <Card className="bg-neutral-900/40 backdrop-blur-sm border-white/5 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-10 border-b border-white/5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                      <ListFilter className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tighter uppercase">Word Filtering</CardTitle>
                  </div>
                  <CardDescription className="text-neutral-400 font-medium text-base">
                    Automated moderation for community safety.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 ml-1">Blacklisted Content (Comma separated)</Label>
                    <Textarea
                      placeholder="Enter sensitive words to filter..."
                      value={wordBlacklist}
                      onChange={(e) => setWordBlacklist(e.target.value)}
                      className="bg-black/40 border-white/5 rounded-2xl min-h-[200px] p-6 font-mono text-sm leading-relaxed focus:ring-primary/50 transition-all text-neutral-200"
                    />
                  </div>
                  <Button 
                    onClick={() => updateBlacklistMutation.mutate()}
                    disabled={updateBlacklistMutation.isPending}
                    className="w-full h-16 rounded-2xl font-black tracking-widest uppercase bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]"
                  >
                    {updateBlacklistMutation.isPending ? "Applying Changes..." : "Secure Word List"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="maintenance" className="mt-0 outline-none">
              <Card className="bg-neutral-900/40 backdrop-blur-sm border-white/5 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-10 border-b border-white/5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                      <Power className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tighter uppercase">System Operations</CardTitle>
                  </div>
                  <CardDescription className="text-neutral-400 font-medium text-base">
                    Control global availability and scheduled maintenance.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  <div className="flex items-center justify-between p-8 bg-black/40 rounded-[1.5rem] border border-white/5">
                    <div className="space-y-1">
                      <Label className="text-lg font-bold">Maintenance Lock</Label>
                      <p className="text-sm text-neutral-500 font-medium">
                        Redirect all traffic to the "Polishing" screen.
                      </p>
                    </div>
                    <Switch
                      checked={maintenanceMode}
                      onCheckedChange={setMaintenanceMode}
                      className="scale-125"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 ml-1">Public Announcement</Label>
                    <Textarea
                      placeholder="Provide context to your users..."
                      value={maintenanceMessage}
                      onChange={(e) => setMaintenanceMessage(e.target.value)}
                      className="bg-black/40 border-white/5 rounded-2xl h-32 p-6 font-medium leading-relaxed focus:ring-primary/50 transition-all text-neutral-200"
                    />
                  </div>
                  <Button 
                    onClick={() => updateMaintenanceMutation.mutate()}
                    disabled={updateMaintenanceMutation.isPending}
                    className={`w-full h-16 rounded-2xl font-black tracking-widest uppercase shadow-xl transition-all hover:scale-[1.01] ${maintenanceMode ? 'bg-destructive hover:bg-destructive/90 text-white shadow-destructive/20' : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'}`}
                  >
                    {updateMaintenanceMutation.isPending ? "Processing..." : "Commit System Changes"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-0 outline-none">
               <div className="grid gap-4">
                {mHistory?.length === 0 ? (
                  <Card className="bg-neutral-900/20 border-white/5 rounded-3xl"><CardContent className="py-20 text-center text-neutral-500 font-medium">No maintenance logs found.</CardContent></Card>
                ) : (
                  mHistory?.map((entry, i) => (
                    <Card key={i} className="bg-neutral-900/40 border-white/5 rounded-[1.5rem] p-2">
                      <CardHeader className="flex flex-row items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${entry.mode === 'on' ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}>
                            {entry.mode === 'on' ? 'Locked' : 'Unlocked'}
                          </span>
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                            {format(new Date(entry.createdAt), "MMM d, h:mm a")}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <p className="text-neutral-300 font-medium text-sm italic">"{entry.message || 'No message provided'}"</p>
                      </CardContent>
                    </Card>
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
