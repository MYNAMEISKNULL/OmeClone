import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { reports, feedback, admin, maintenanceHistory } from "@shared/schema";
import type { Report, Feedback, Admin } from "@shared/schema";
import { format } from "date-fns";
import { Shield, MessageSquare, Clock, Lock, Power, Activity, ListFilter, History } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
    refetchInterval: 5000,
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl h-12"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl text-lg font-bold">
                LOGIN
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Admin Controller</h1>
            <p className="text-muted-foreground mt-2">Oversee reports and user feedback.</p>
          </div>
        </div>

        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 mb-8">
            <TabsTrigger value="reports" className="gap-2">
              <Shield className="w-4 h-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="health" className="gap-2">
              <Activity className="w-4 h-4" />
              Health
            </TabsTrigger>
            <TabsTrigger value="blacklist" className="gap-2">
              <ListFilter className="w-4 h-4" />
              Filters
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="gap-2">
              <Power className="w-4 h-4" />
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="mt-6">
            <div className="grid gap-4">
              {loadingReports ? (
                <p>Loading reports...</p>
              ) : reports?.length === 0 ? (
                <Card><CardContent className="py-8 text-center text-muted-foreground">No reports yet.</CardContent></Card>
              ) : (
                reports?.map((report) => (
                  <Card key={report.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Shield className="w-4 h-4 text-destructive" />
                        Report #{report.id}
                      </CardTitle>
                      <div className="flex items-center text-xs text-muted-foreground gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(report.createdAt!), "MMM d, h:mm a")}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground">{report.reason}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="mt-6">
            <div className="grid gap-4">
              {loadingFeedback ? (
                <p>Loading feedback...</p>
              ) : feedback?.length === 0 ? (
                <Card><CardContent className="py-8 text-center text-muted-foreground">No feedback yet.</CardContent></Card>
              ) : (
                feedback?.map((fb) => (
                  <Card key={fb.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        Rating: {fb.rating}/5
                      </CardTitle>
                      <div className="flex items-center text-xs text-muted-foreground gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(fb.createdAt!), "MMM d, h:mm a")}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground">{fb.content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Mode</CardTitle>
                <CardDescription>
                  Shut down the website and show a message to all users.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="maintenance-mode" className="flex flex-col space-y-1">
                    <span>Activate Maintenance Mode</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      When active, users will see the maintenance message.
                    </span>
                  </Label>
                  <Switch
                    id="maintenance-mode"
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenance-message">Maintenance Message</Label>
                  <Textarea
                    id="maintenance-message"
                    placeholder="Enter the message to show to users..."
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button 
                  onClick={() => updateMaintenanceMutation.mutate()}
                  disabled={updateMaintenanceMutation.isPending}
                  className="w-full h-12 font-bold"
                >
                  {updateMaintenanceMutation.isPending ? "UPDATING..." : "UPDATE SETTINGS"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
        </Tabs>
      </div>
    </div>
  );
}
