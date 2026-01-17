import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Report, Feedback } from "@shared/schema";
import { format } from "date-fns";
import { Shield, MessageSquare, Clock } from "lucide-react";

export default function AdminDashboard() {
  const { data: reports, isLoading: loadingReports } = useQuery<Report[]>({
    queryKey: ["/api/admin/reports"],
  });

  const { data: feedback, isLoading: loadingFeedback } = useQuery<Feedback[]>({
    queryKey: ["/api/admin/feedback"],
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Admin Controller</h1>
          <p className="text-muted-foreground mt-2">Oversee reports and user feedback.</p>
        </div>

        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="reports" className="gap-2">
              <Shield className="w-4 h-4" />
              Reports ({reports?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Feedback ({feedback?.length || 0})
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
        </Tabs>
      </div>
    </div>
  );
}
